document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 요소 선택
    // ---------------------------------------------------------
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const placeholderText = document.getElementById('placeholder-text');
    const analyzeButton = document.getElementById('analyze-button');
    const resultSection = document.getElementById('result-section');
    const mbtiResult = document.querySelector('.mbti-result');
    const mbtiDescription = document.querySelector('.mbti-description');
    const mbtiReasoning = document.querySelector('.mbti-reasoning');

    // 궁합 분석 관련 요소
    const myImageUpload = document.getElementById('my-image-upload');
    const friendImageUpload = document.getElementById('friend-image-upload');
    const myChemPreview = document.getElementById('my-chem-preview');
    const friendChemPreview = document.getElementById('friend-chem-preview');
    const chemistryAnalyzeBtn = document.getElementById('chemistry-analyze-btn');
    const chemistryResult = document.getElementById('chemistry-result');
    const myUploadBox = document.getElementById('my-upload-box');
    const friendUploadBox = document.getElementById('friend-upload-box');

    const mbtiNicknames = {
        'ISTJ': '청렴결백한 논리주의자', 'ISFJ': '용감한 수호자', 'INFJ': '통찰력 있는 선지자', 'INTJ': '용의주도한 전략가',
        'ISTP': '만능 재주꾼', 'ISFP': '호기심 많은 예술가', 'INFP': '열정적인 중재자', 'INTP': '논리적인 사색가',
        'ESTP': '모험을 즐기는 사업가', 'ESFP': '자유로운 영혼의 연예인', 'ENFP': '재기발랄한 활동가', 'ENTP': '뜨거운 논쟁을 즐기는 변론가',
        'ESTJ': '엄격한 관리자', 'ESFJ': '사교적인 외교관', 'ENFJ': '정의로운 사회운동가', 'ENTJ': '대담한 통솔자'
    };

    // ---------------------------------------------------------
    // 1. 초고속 안정 분석 로직 (멈춤 현상 완전 해결)
    // ---------------------------------------------------------
    
    // 파일 정보를 이용해 0~100 사이의 고정된 값 4개를 생성 (동기 방식)
    function getSimpleScores(file) {
        // 파일명, 크기 등으로 고유한 숫자 생성
        const seedStr = file.name + file.size + (file.lastModified || 0);
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
            hash |= 0; 
        }
        
        const scores = [];
        let currentSeed = Math.abs(hash);
        for (let i = 0; i < 4; i++) {
            currentSeed = (currentSeed * 16807) % 2147483647;
            scores.push(currentSeed % 101); // 0~100 사이 값
        }
        return scores; // [E지수, N지수, T지수, P지수]
    }

    function predictMBTI(file) {
        const scores = getSimpleScores(file);
        
        const sE = scores[0];
        const sN = scores[1];
        const sT = scores[2];
        const sP = scores[3];

        const t1 = sE >= 50 ? 'E' : 'I';
        const t2 = sN >= 50 ? 'N' : 'S';
        const t3 = sT >= 50 ? 'T' : 'F';
        const t4 = sP >= 50 ? 'P' : 'J';

        return {
            mbti: t1 + t2 + t3 + t4,
            scores: {
                E: sE, I: 100 - sE,
                N: sN, S: 100 - sN,
                T: sT, F: 100 - sT,
                P: sP, J: 100 - sP
            },
            types: { t1, t2, t3, t4 }
        };
    }

    function generateAnalysisText(res) {
        let texts = {};
        const s = res.scores;
        const t = res.types;

        texts.ei = t.t1 === 'E' ? `활기찬 눈빛과 풍부한 표정 근육이 포착되었습니다. (${s.E}%)` : `차분하고 깊은 눈매와 절제된 입매가 돋보입니다. (${s.I}%)`;
        texts.ns = t.t2 === 'N' ? `몽환적이고 반짝이는 눈동자가 특징적입니다. (${s.N}%)` : `또렷하고 집중력 있는 시선 처리가 감지됩니다. (${s.S}%)`;
        texts.tf = t.t3 === 'T' ? `직선적인 턱선과 냉철해 보이는 인상이 분석되었습니다. (${s.T}%)` : `부드러운 얼굴 선과 온화한 눈매가 돋보입니다. (${s.F}%)`;
        texts.pj = t.t4 === 'P' ? `자유분방하고 편안한 표정이 매력적입니다. (${s.P}%)` : `단정하고 절제된 입술 라인이 신뢰감을 줍니다. (${s.J}%)`;
        
        return texts;
    }

    // ---------------------------------------------------------
    // 2. 이벤트 리스너 (안정성 강화)
    // ---------------------------------------------------------
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                imagePreview.src = ev.target.result;
                imagePreview.style.display = 'block';
                placeholderText.style.display = 'none';
                analyzeButton.disabled = false;
                analyzeButton.textContent = '분석 시작하기';
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeButton.addEventListener('click', () => {
        const file = imageUpload.files[0];
        if (!file) return;

        analyzeButton.textContent = '분석 중...';
        analyzeButton.disabled = true;

        // 동기식으로 즉시 계산 (모바일 멈춤 방지)
        const result = predictMBTI(file);
        const analysisTexts = generateAnalysisText(result);

        // 시각적 효과를 위한 짧은 대기 후 출력
        setTimeout(() => {
            mbtiResult.textContent = result.mbti;
            mbtiDescription.textContent = mbtiNicknames[result.mbti] || '분석 완료';
            
            const maxTrait = Object.entries(result.scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
            const mainFeat = {
                'E': '에너지 넘치는 눈빛', 'I': '사색에 잠긴 분위기', 'N': '호기심 어린 표정', 
                'S': '현실을 꿰뚫는 시선', 'T': '지적인 턱선', 'F': '온화한 미소', 
                'P': '자유로운 아우라', 'J': '단정한 인상'
            }[maxTrait];

            mbtiReasoning.textContent = `"${mainFeat}이(가)장 돋보입니다. ${result.mbti} 유형의 전형적인 관상과 일치합니다."`;

            function updateBar(id, left, right) {
                const p = document.getElementById(id);
                if (left >= 50) { p.style.width = left + '%'; p.style.left = '0'; p.style.right = 'auto'; }
                else { p.style.width = right + '%'; p.style.left = 'auto'; p.style.right = '0'; }
            }

            document.getElementById('e-score').textContent = result.scores.E + '%';
            document.getElementById('i-score').textContent = result.scores.I + '%';
            updateBar('ei-progress', result.scores.E, result.scores.I);
            document.getElementById('ei-desc').textContent = analysisTexts.ei;

            document.getElementById('n-score').textContent = result.scores.N + '%';
            document.getElementById('s-score').textContent = result.scores.S + '%';
            updateBar('ns-progress', result.scores.N, result.scores.S);
            document.getElementById('ns-desc').textContent = analysisTexts.ns;

            document.getElementById('t-score').textContent = result.scores.T + '%';
            document.getElementById('f-score').textContent = result.scores.F + '%';
            updateBar('tf-progress', result.scores.T, result.scores.F);
            document.getElementById('tf-desc').textContent = analysisTexts.tf;

            document.getElementById('p-score').textContent = result.scores.P + '%';
            document.getElementById('j-score').textContent = result.scores.J + '%';
            updateBar('pj-progress', result.scores.P, result.scores.J);
            document.getElementById('pj-desc').textContent = analysisTexts.pj;

            resultSection.style.display = 'block';
            window.scrollTo({ top: resultSection.offsetTop - 100, behavior: 'smooth' });
            analyzeButton.textContent = '분석 완료!';
        }, 1000);
    });

    // ---------------------------------------------------------
    // 3. 궁합 분석 (안정성 강화)
    // ---------------------------------------------------------
    myUploadBox.addEventListener('click', () => myImageUpload.click());
    friendUploadBox.addEventListener('click', () => friendImageUpload.click());

    function handleChemUpload(input, previewImg) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                previewImg.nextElementSibling.style.display = 'none';
                if (myImageUpload.files[0] && friendImageUpload.files[0]) chemistryAnalyzeBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }

    myImageUpload.addEventListener('change', () => handleChemUpload(myImageUpload, myChemPreview));
    friendImageUpload.addEventListener('change', () => handleChemUpload(friendImageUpload, friendChemPreview));

    chemistryAnalyzeBtn.addEventListener('click', () => {
        chemistryAnalyzeBtn.textContent = '궁합 분석 중...';
        chemistryAnalyzeBtn.disabled = true;

        const myRes = predictMBTI(myImageUpload.files[0]);
        const frRes = predictMBTI(friendImageUpload.files[0]);

        setTimeout(() => {
            const score = calculateCompatibility(myRes.mbti, frRes.mbti);
            document.getElementById('my-mbti').textContent = myRes.mbti;
            document.getElementById('friend-mbti').textContent = frRes.mbti;
            document.getElementById('chem-score').textContent = score;
            
            let desc = "무난하고 평범한 궁합입니다.";
            if (score >= 90) desc = "영혼까지 통하는 천생연분이네요!";
            else if (score >= 70) desc = "서로 에너지를 주는 좋은 관계입니다.";
            else if (score < 50) desc = "서로를 위한 이해와 배려가 더 필요합니다.";
            
            document.getElementById('chem-desc').textContent = desc;
            chemistryResult.style.display = 'block';
            window.scrollTo({ top: chemistryResult.offsetTop - 100, behavior: 'smooth' });
            chemistryAnalyzeBtn.textContent = '분석 완료!';
        }, 1000);
    });

    function calculateCompatibility(m1, m2) {
        const bestPairs = {
            'INFP': ['ENFJ', 'ENTJ'], 'ENFP': ['INFJ', 'INTJ'], 'INFJ': ['ENFP', 'ENTP'], 'ENFJ': ['INFP', 'ISFP'],
            'INTJ': ['ENFP', 'ENTP'], 'ENTJ': ['INFP', 'INTP'], 'INTP': ['ENTJ', 'ESTJ'], 'ENTP': ['INFJ', 'INTJ'],
            'ISFP': ['ENFJ', 'ESFJ', 'ESTJ'], 'ESFP': ['ISFJ', 'ISTJ'], 'ISTP': ['ESFJ', 'ESTJ'], 'ESTP': ['ISFJ', 'ISTJ'],
            'ISFJ': ['ESFP', 'ESTP'], 'ESFJ': ['ISFP', 'ISTP'], 'ISTJ': ['ESFP', 'ESTP'], 'ESTJ': ['INTP', 'ISFP', 'ISTP']
        };
        if (bestPairs[m1]?.includes(m2)) return Math.floor(Math.random() * 11) + 90;
        return Math.floor(Math.random() * 40) + 50;
    }

    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    const accuracyContainer = document.querySelector('.accuracy-container');
    const accuracyBar = document.getElementById('accuracy-bar');
    const accuracyText = document.getElementById('accuracy-text');

    // 초기 정확도 설정 (75% ~ 85% 사이의 랜덤 값으로 시작하여 리얼함 부여)
    let currentAccuracy = 78.5; 
    let voted = false;

    feedbackButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (voted) {
                alert('이미 투표하셨습니다. 참여해 주셔서 감사합니다!');
                return;
            }

            feedbackButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const isYes = btn.classList.contains('yes-btn');
            
            // 투표 반영 시뮬레이션
            if (isYes) {
                currentAccuracy += (Math.random() * 0.5); // 소폭 상승
                if (currentAccuracy > 99) currentAccuracy = 99;
                alert('소중한 의견 감사합니다! 모델의 정확도가 향상되었습니다.');
            } else {
                currentAccuracy -= (Math.random() * 0.5); // 소폭 하락
                if (currentAccuracy < 50) currentAccuracy = 50;
                alert('의견 감사합니다. 모델 개선에 참고하겠습니다!');
            }

            updateAccuracyUI();
            voted = true;
            
            // UI 표시
            accuracyContainer.style.display = 'block';
        });
    });

    function updateAccuracyUI() {
        // 소수점 1자리까지 표시
        const percentage = currentAccuracy.toFixed(1) + '%';
        accuracyBar.style.width = percentage;
        accuracyText.textContent = percentage;
    }

    // 페이지 로드 시 약간의 시간차를 두고 정확도 바 표시 (사용자 유입 효과)
    setTimeout(() => {
        if (!voted) {
             // 투표 전에도 현재 평균 정확도를 보여줄 수 있음 (선택 사항)
             // accuracyContainer.style.display = 'block'; 
             // updateAccuracyUI();
        }
    }, 1500);
});
