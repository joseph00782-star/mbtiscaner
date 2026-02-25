
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
    // 1. 이미지 분석 로직 (모바일 안정성 강화)
    // ---------------------------------------------------------
    
    function getFileBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async function getImageHash(file) {
        try {
            if (window.crypto && window.crypto.subtle) {
                const buffer = await getFileBuffer(file);
                const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                return Array.from(new Uint8Array(hashBuffer));
            }
        } catch (e) {
            console.warn("Crypto API 실패, 폴백 사용");
        }
        const fallback = [];
        let seed = file.size + file.name.length;
        for (let i = 0; i < 32; i++) {
            seed = (seed * 16807) % 2147483647;
            fallback.push(seed % 256);
        }
        return fallback;
    }

    async function predictMBTI(file) {
        const hash = await getImageHash(file);
        const scoreE = Math.floor((hash[0] / 255) * 100);
        const scoreN = Math.floor((hash[1] / 255) * 100);
        const scoreT = Math.floor((hash[2] / 255) * 100);
        const scoreP = Math.floor((hash[3] / 255) * 100);

        const type1 = scoreE >= 50 ? 'E' : 'I';
        const type2 = scoreN >= 50 ? 'N' : 'S';
        const type3 = scoreT >= 50 ? 'T' : 'F';
        const type4 = scoreP >= 50 ? 'P' : 'J';

        return {
            mbti: type1 + type2 + type3 + type4,
            scores: {
                E: scoreE, I: 100 - scoreE,
                N: scoreN, S: 100 - scoreN,
                T: scoreT, F: 100 - scoreT,
                P: scoreP, J: 100 - scoreP
            },
            types: { type1, type2, type3, type4 }
        };
    }

    function generateAnalysisText(scores, types) {
        let texts = {};
        if (types.type1 === 'E') texts.ei = `활기찬 눈빛과 풍부한 표정 근육이 포착되었습니다. (${scores.E}%)`;
        else texts.ei = `차분하고 깊은 눈매와 절제된 입매가 돋보입니다. (${scores.I}%)`;
        if (types.type2 === 'N') texts.ns = `몽환적이고 반짝이는 눈동자가 특징적입니다. (${scores.N}%)`;
        else texts.ns = `또렷하고 집중력 있는 시선 처리가 감지됩니다. (${scores.S}%)`;
        if (types.type3 === 'T') texts.tf = `직선적인 턱선과 냉철해 보이는 인상이 분석되었습니다. (${scores.T}%)`;
        else texts.tf = `부드러운 얼굴 선과 온화한 눈매가 돋보입니다. (${scores.F}%)`;
        if (types.type4 === 'P') texts.pj = `자유분방하고 편안한 표정이 매력적입니다. (${scores.P}%)`;
        else texts.pj = `단정하고 절제된 입술 라인이 신뢰감을 줍니다. (${scores.J}%)`;
        return texts;
    }

    // ---------------------------------------------------------
    // 2. 개별 분석 이벤트
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
                analyzeButton.textContent = '분석 시작하기';
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeButton.addEventListener('click', async () => {
        const file = imageUpload.files[0];
        if (!file) return;

        try {
            analyzeButton.textContent = '모델 분석 중...';
            analyzeButton.disabled = true;

            const result = await predictMBTI(file);
            const analysisTexts = generateAnalysisText(result.scores, result.types);

            setTimeout(() => {
                mbtiResult.textContent = result.mbti;
                mbtiDescription.textContent = mbtiNicknames[result.mbti] || '분석 완료';
                
                const maxScoreTrait = Object.entries(result.scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
                let mainFeature = "";
                if (maxScoreTrait === 'E') mainFeature = "에너지 넘치는 눈빛";
                else if (maxScoreTrait === 'I') mainFeature = "사색에 잠긴 분위기";
                else if (maxScoreTrait === 'N') mainFeature = "호기심 어린 표정";
                else if (maxScoreTrait === 'S') mainFeature = "현실을 꿰뚫는 시선";
                else if (maxScoreTrait === 'T') mainFeature = "지적인 턱선";
                else if (maxScoreTrait === 'F') mainFeature = "온화한 미소";
                else if (maxScoreTrait === 'P') mainFeature = "자유로운 아우라";
                else mainFeature = "단정한 인상";

                mbtiReasoning.textContent = `"${mainFeature}이(가) 가장 돋보입니다. ${result.mbti} 유형의 전형적인 관상과 일치합니다."`;

                function updateProgressBar(progressId, scoreLeft, scoreRight) {
                    const progress = document.getElementById(progressId);
                    if (scoreLeft >= 50) {
                        progress.style.width = scoreLeft + '%';
                        progress.style.left = '0';
                        progress.style.right = 'auto';
                    } else {
                        progress.style.width = scoreRight + '%';
                        progress.style.left = 'auto';
                        progress.style.right = '0';
                    }
                }

                // UI 업데이트
                document.getElementById('e-score').textContent = result.scores.E + '%';
                document.getElementById('i-score').textContent = result.scores.I + '%';
                updateProgressBar('ei-progress', result.scores.E, result.scores.I);
                document.getElementById('ei-desc').textContent = analysisTexts.ei;

                document.getElementById('n-score').textContent = result.scores.N + '%';
                document.getElementById('s-score').textContent = result.scores.S + '%';
                updateProgressBar('ns-progress', result.scores.N, result.scores.S);
                document.getElementById('ns-desc').textContent = analysisTexts.ns;

                document.getElementById('t-score').textContent = result.scores.T + '%';
                document.getElementById('f-score').textContent = result.scores.F + '%';
                updateProgressBar('tf-progress', result.scores.T, result.scores.F);
                document.getElementById('tf-desc').textContent = analysisTexts.tf;

                document.getElementById('p-score').textContent = result.scores.P + '%';
                document.getElementById('j-score').textContent = result.scores.J + '%';
                updateProgressBar('pj-progress', result.scores.P, result.scores.J);
                document.getElementById('pj-desc').textContent = analysisTexts.pj;

                resultSection.style.display = 'block';
                resultSection.scrollIntoView({ behavior: 'smooth' });
                analyzeButton.textContent = '분석 완료!';
            }, 1000);
        } catch (error) {
            console.error(error);
            alert('분석 도중 오류가 발생했습니다. 다시 시도해 주세요.');
            analyzeButton.disabled = false;
            analyzeButton.textContent = '분석 시작하기';
        }
    });

    // ---------------------------------------------------------
    // 3. 궁합 분석 이벤트
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
                if (myImageUpload.files[0] && friendImageUpload.files[0]) {
                    chemistryAnalyzeBtn.disabled = false;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    myImageUpload.addEventListener('change', () => handleChemUpload(myImageUpload, myChemPreview));
    friendImageUpload.addEventListener('change', () => handleChemUpload(friendImageUpload, friendChemPreview));

    chemistryAnalyzeBtn.addEventListener('click', async () => {
        try {
            chemistryAnalyzeBtn.textContent = '궁합 분석 중...';
            chemistryAnalyzeBtn.disabled = true;
            const myResult = await predictMBTI(myImageUpload.files[0]);
            const friendResult = await predictMBTI(friendImageUpload.files[0]);

            setTimeout(() => {
                const score = calculateCompatibility(myResult.mbti, friendResult.mbti);
                document.getElementById('my-mbti').textContent = myResult.mbti;
                document.getElementById('friend-mbti').textContent = friendResult.mbti;
                document.getElementById('chem-score').textContent = score;
                document.getElementById('chem-desc').textContent = getChemDescription(score);
                chemistryResult.style.display = 'block';
                chemistryResult.scrollIntoView({ behavior: 'smooth' });
                chemistryAnalyzeBtn.textContent = '분석 완료!';
            }, 1000);
        } catch (error) {
            alert('궁합 분석 중 오류가 발생했습니다.');
            chemistryAnalyzeBtn.disabled = false;
            chemistryAnalyzeBtn.textContent = '분석 시작하기';
        }
    });

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
        if (bestPairs[m1]?.includes(m2)) return Math.floor(Math.random() * 11) + 90;
        const worstPairs = {
            'INFP': ['ESTP', 'ISTP'], 'ENFP': ['ISTJ', 'ESTJ'],
            'INFJ': ['ESTP', 'ISTP'], 'ENFJ': ['ISTJ', 'ESTJ'],
            'INTJ': ['ESFJ', 'ISFJ'], 'ENTJ': ['ISFJ', 'ESFJ'],
            'INTP': ['ESFJ', 'ISFJ'], 'ENTP': ['ISFJ', 'ESFJ']
        };
        if (worstPairs[m1]?.includes(m2)) return Math.floor(Math.random() * 20) + 20;
        return Math.floor(Math.random() * 30) + 50;
    }

    function getChemDescription(score) {
        if (score >= 90) return "영혼까지 통하는 천생연분이네요!";
        if (score >= 70) return "서로 에너지를 주는 좋은 관계입니다.";
        if (score >= 50) return "무난하고 평범한 궁합입니다.";
        return "서로를 위한 이해와 배려가 조금 더 필요합니다.";
    }

    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    feedbackButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            feedbackButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.classList.contains('yes-btn')) alert('소중한 의견 감사합니다!');
            else alert('의견 감사합니다. 모델 개선에 참고하겠습니다!');
        });
    });
});
