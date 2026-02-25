
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

    const mbtiTypes = ['ENFP', 'ENFJ', 'ENTP', 'ENTJ', 'ESFP', 'ESFJ', 'ESTP', 'ESTJ', 'INFP', 'INFJ', 'INTP', 'INTJ', 'ISFP', 'ISFJ', 'ISTP', 'ISTJ'];

    // MBTI별 한 줄 설명 (별명)
    const mbtiNicknames = {
        'ISTJ': '청렴결백한 논리주의자', 'ISFJ': '용감한 수호자',
        'INFJ': '통찰력 있는 선지자', 'INTJ': '용의주도한 전략가',
        'ISTP': '만능 재주꾼', 'ISFP': '호기심 많은 예술가',
        'INFP': '열정적인 중재자', 'INTP': '논리적인 사색가',
        'ESTP': '모험을 즐기는 사업가', 'ESFP': '자유로운 영혼의 연예인',
        'ENFP': '재기발랄한 활동가', 'ENTP': '뜨거운 논쟁을 즐기는 변론가',
        'ESTJ': '엄격한 관리자', 'ESFJ': '사교적인 외교관',
        'ENFJ': '정의로운 사회운동가', 'ENTJ': '대담한 통솔자'
    };

    // ---------------------------------------------------------
    // 1. 이미지 해시 및 분석 시뮬레이션 함수 (핵심 로직)
    // ---------------------------------------------------------
    
    // 이미지를 기반으로 고정된 난수 생성 (같은 이미지 -> 같은 결과)
    async function getImageHash(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // 해시의 앞부분 일부를 사용하여 0~1 사이의 값들을 생성
        return hashArray; 
    }

    // 4가지 모델 점수 생성기
    async function predictMBTI(file) {
        const hash = await getImageHash(file);
        
        // 해시 바이트를 사용하여 각 지표별 점수(0~100) 생성
        // E vs I (Byte 0)
        const scoreE = Math.floor((hash[0] / 255) * 100);
        const scoreI = 100 - scoreE;
        const type1 = scoreE >= 50 ? 'E' : 'I';

        // N vs S (Byte 1)
        const scoreN = Math.floor((hash[1] / 255) * 100);
        const scoreS = 100 - scoreN;
        const type2 = scoreN >= 50 ? 'N' : 'S';

        // T vs F (Byte 2)
        const scoreT = Math.floor((hash[2] / 255) * 100);
        const scoreF = 100 - scoreT;
        const type3 = scoreT >= 50 ? 'T' : 'F';

        // P vs J (Byte 3)
        const scoreP = Math.floor((hash[3] / 255) * 100);
        const scoreJ = 100 - scoreP;
        const type4 = scoreP >= 50 ? 'P' : 'J';

        const finalMBTI = type1 + type2 + type3 + type4;

        return {
            mbti: finalMBTI,
            scores: {
                E: scoreE, I: scoreI,
                N: scoreN, S: scoreS,
                T: scoreT, F: scoreF,
                P: scoreP, J: scoreJ
            },
            types: { type1, type2, type3, type4 }
        };
    }

    // 결과 텍스트 생성기 (관상학적 근거 포함)
    function generateAnalysisText(scores, types) {
        let texts = {};

        // E vs I
        if (types.type1 === 'E') {
            texts.ei = `활기찬 눈빛과 풍부한 표정 근육이 포착되었습니다. (${scores.E}%) 타인에게 개방적이고 에너지를 발산하는 '외향형'의 특징이 강하게 나타납니다.`;
        } else {
            texts.ei = `차분하고 깊은 눈매와 절제된 입매가 돋보입니다. (${scores.I}%) 내면의 생각에 집중하며 신중한 태도를 보이는 '내향형'의 관상입니다.`;
        }

        // N vs S
        if (types.type2 === 'N') {
            texts.ns = `몽환적이고 반짝이는 눈동자가 특징적입니다. (${scores.N}%) 현실 너머의 이상을 좇으며 상상력이 풍부한 '직관형'의 분위기를 풍깁니다.`;
        } else {
            texts.ns = `또렷하고 집중력 있는 시선 처리가 감지됩니다. (${scores.S}%) 주변 상황을 정확하게 파악하고 현실적인 감각이 뛰어난 '감각형'의 특징입니다.`;
        }

        // T vs F
        if (types.type3 === 'T') {
            texts.tf = `직선적인 턱선과 냉철해 보이는 인상이 분석되었습니다. (${scores.T}%) 감정보다는 논리와 사실을 중시하는 '사고형'의 이지적인 이미지를 가졌습니다.`;
        } else {
            texts.tf = `부드러운 얼굴 선과 온화한 눈매가 돋보입니다. (${scores.F}%) 공감 능력이 뛰어나고 타인을 배려하는 '감정형'의 따뜻한 인상입니다.`;
        }

        // P vs J
        if (types.type4 === 'P') {
            texts.pj = `자유분방하고 편안한 표정이 매력적입니다. (${scores.P}%) 상황에 따라 유연하게 대처하며 개방적인 태도를 지닌 '인식형'의 관상입니다.`;
        } else {
            texts.pj = `단정하고 절제된 입술 라인이 신뢰감을 줍니다. (${scores.J}%) 계획적이고 질서 정연한 것을 선호하는 '판단형'의 깔끔한 이미지가 강합니다.`;
        }

        return texts;
    }

    // ---------------------------------------------------------
    // 2. 개별 분석 이벤트 리스너
    // ---------------------------------------------------------
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                placeholderText.style.display = 'none';
                analyzeButton.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeButton.addEventListener('click', async () => {
        const file = imageUpload.files[0];
        if (!file) return;

        analyzeButton.textContent = '4가지 모델 분석 중...';
        analyzeButton.disabled = true;

        // 분석 시뮬레이션 실행
        const result = await predictMBTI(file);
        const analysisTexts = generateAnalysisText(result.scores, result.types);

        setTimeout(() => {
            // 결과 화면 업데이트
            mbtiResult.textContent = result.mbti;
            mbtiDescription.textContent = mbtiNicknames[result.mbti] || '알 수 없는 유형';
            
            // 종합 코멘트 (가장 높은 점수 기반)
            const maxScoreTrait = Object.entries(result.scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
            let mainFeature = "";
            if (maxScoreTrait === 'E') mainFeature = "에너지 넘치는 눈빛";
            if (maxScoreTrait === 'I') mainFeature = "사색에 잠긴 듯한 분위기";
            if (maxScoreTrait === 'N') mainFeature = "호기심 어린 표정";
            if (maxScoreTrait === 'S') mainFeature = "현실을 꿰뚫어 보는 시선";
            if (maxScoreTrait === 'T') mainFeature = "지적이고 샤프한 턱선";
            if (maxScoreTrait === 'F') mainFeature = "사람을 무장해제시키는 미소";
            if (maxScoreTrait === 'P') mainFeature = "자유로운 영혼의 아우라";
            if (maxScoreTrait === 'J') mainFeature = "신뢰감을 주는 단정한 인상";

            mbtiReasoning.textContent = `"${mainFeature}이(가) 가장 돋보입니다. 전체적으로 ${result.mbti}의 특징과 90% 이상 일치하는 관상입니다."`;

            // 게이지바 업데이트 함수 (높은 쪽에서 게이지가 나오도록 설정)
            function updateProgressBar(progressId, scoreLeft, scoreRight) {
                const progress = document.getElementById(progressId);
                if (scoreLeft >= 50) {
                    // 왼쪽(E, N, T, P)이 높을 때: 왼쪽에서 오른쪽으로
                    progress.style.width = scoreLeft + '%';
                    progress.style.left = '0';
                    progress.style.right = 'auto';
                } else {
                    // 오른쪽(I, S, F, J)이 높을 때: 오른쪽에서 왼쪽으로
                    progress.style.width = scoreRight + '%';
                    progress.style.left = 'auto';
                    progress.style.right = '0';
                }
            }

            // 모델별 진행바 및 텍스트 업데이트
            // 1. E vs I
            document.getElementById('e-score').textContent = result.scores.E + '%';
            document.getElementById('i-score').textContent = result.scores.I + '%';
            updateProgressBar('ei-progress', result.scores.E, result.scores.I);
            document.getElementById('ei-desc').textContent = analysisTexts.ei;

            // 2. N vs S
            document.getElementById('n-score').textContent = result.scores.N + '%';
            document.getElementById('s-score').textContent = result.scores.S + '%';
            updateProgressBar('ns-progress', result.scores.N, result.scores.S);
            document.getElementById('ns-desc').textContent = analysisTexts.ns;

            // 3. T vs F
            document.getElementById('t-score').textContent = result.scores.T + '%';
            document.getElementById('f-score').textContent = result.scores.F + '%';
            updateProgressBar('tf-progress', result.scores.T, result.scores.F);
            document.getElementById('tf-desc').textContent = analysisTexts.tf;

            // 4. P vs J
            document.getElementById('p-score').textContent = result.scores.P + '%';
            document.getElementById('j-score').textContent = result.scores.J + '%';
            updateProgressBar('pj-progress', result.scores.P, result.scores.J);
            document.getElementById('pj-desc').textContent = analysisTexts.pj;

            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });
            analyzeButton.textContent = '분석 완료!';
        }, 2000);
    });

    // ---------------------------------------------------------
    // 3. 궁합 분석 로직 (기존 유지 + MBTI 예측 적용)
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
                checkChemReady();
            };
            reader.readAsDataURL(file);
        }
    }

    myImageUpload.addEventListener('change', () => handleChemUpload(myImageUpload, myChemPreview));
    friendImageUpload.addEventListener('change', () => handleChemUpload(friendImageUpload, friendChemPreview));

    function checkChemReady() {
        if (myImageUpload.files[0] && friendImageUpload.files[0]) {
            chemistryAnalyzeBtn.disabled = false;
        }
    }

    chemistryAnalyzeBtn.addEventListener('click', async () => {
        chemistryAnalyzeBtn.textContent = '궁합 분석 중...';
        chemistryAnalyzeBtn.disabled = true;

        const myFile = myImageUpload.files[0];
        const friendFile = friendImageUpload.files[0];

        // 각각의 MBTI 예측
        const myResult = await predictMBTI(myFile);
        const friendResult = await predictMBTI(friendFile);

        setTimeout(() => {
            const myMBTI = myResult.mbti;
            const friendMBTI = friendResult.mbti;
            
            const score = calculateCompatibility(myMBTI, friendMBTI);
            const description = getChemDescription(score);

            document.getElementById('my-mbti').textContent = myMBTI;
            document.getElementById('friend-mbti').textContent = friendMBTI;
            document.getElementById('chem-score').textContent = score;
            document.getElementById('chem-desc').textContent = description;

            chemistryResult.style.display = 'block';
            chemistryResult.scrollIntoView({ behavior: 'smooth' });
            chemistryAnalyzeBtn.textContent = '분석 완료!';
        }, 2000);
    });

    // 궁합 점수 계산 로직
    function calculateCompatibility(m1, m2) {
        const bestPairs = {
            'INFP': ['ENFJ', 'ENTJ'], 'ENFP': ['INFJ', 'INTJ'],
            'INFJ': ['ENFP', 'ENTP'], 'ENFJ': ['INFP', 'ISFP'],
            'INTJ': ['ENFP', 'ENTP'], 'ENTJ': ['INFP', 'INTP'],
            'INTP': ['ENTJ', 'ESTJ'], 'ENTP': ['INFJ', 'INTJ'],
            'ISFP': ['ENFJ', 'ESFJ', 'ESTJ'], 'ESFP': ['ISFJ', 'ISTJ'],
            'ISTP': ['ESFJ', 'ESTJ'], 'ESTP': ['ISFJ', 'ISTJ'],
            'ISFJ': ['ESFP', 'ESTP'], 'ESFJ': ['ISFP', 'ISTP'],
            'ISTJ': ['ESFP', 'ESTP'], 'ESTJ': ['INTP', 'ISFP', 'ISTP']
        };

        if (bestPairs[m1]?.includes(m2)) return Math.floor(Math.random() * 11) + 90; // 90-100
        
        // 파국인 조합 (일부 예시)
        const worstPairs = {
            'INFP': ['ESTP', 'ISTP'], 'ENFP': ['ISTJ', 'ESTJ'],
            'INFJ': ['ESTP', 'ISTP'], 'ENFJ': ['ISTJ', 'ESTJ'],
            'INTJ': ['ESFJ', 'ISFJ'], 'ENTJ': ['ISFJ', 'ESFJ'],
            'INTP': ['ESFJ', 'ISFJ'], 'ENTP': ['ISFJ', 'ESFJ']
        };
        if (worstPairs[m1]?.includes(m2)) return Math.floor(Math.random() * 20) + 20; // 20-40

        return Math.floor(Math.random() * 30) + 50; // 50-80
    }

    function getChemDescription(score) {
        if (score >= 90) return "서로의 부족한 점을 채워주는 완벽한 파트너! 관상부터 영혼까지 통하는 천생연분이네요.";
        if (score >= 70) return "함께 있으면 에너지가 넘치는 좋은 관계입니다. 서로의 가치관을 존중하며 즐거운 시간을 보낼 수 있어요.";
        if (score >= 50) return "무난하고 평범한 궁합입니다. 서로 조금씩 맞춰가다 보면 더 깊은 우정을 쌓을 수 있을 거예요.";
        return "관상으로 본 두 분의 기운이 조금 충돌하네요. 서로의 다름을 이해하고 배려하는 노력이 필요해 보입니다.";
    }

    // ---------------------------------------------------------
    // 4. 기타 인터랙션
    // ---------------------------------------------------------
    const shareButton = document.querySelector('.share-button');
    shareButton.addEventListener('click', () => {
        alert('인스타그램 스토리 공유 기능은 곧 업데이트될 예정입니다!');
    });

    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    feedbackButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            feedbackButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.classList.contains('yes-btn')) {
                alert('소중한 의견 감사합니다! 더욱 정확한 분석을 위해 노력하겠습니다.');
            } else {
                alert('의견 감사합니다. AI 모델을 더욱 개선하여 정확도를 높이겠습니다!');
            }
        });
    });
});
