document.addEventListener('DOMContentLoaded', () => {
    // 1. 개별 분석 관련 요소
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const placeholderText = document.getElementById('placeholder-text');
    const analyzeButton = document.getElementById('analyze-button');
    const resultSection = document.getElementById('result-section');

    // 2. 궁합 분석 관련 요소
    const myImageUpload = document.getElementById('my-image-upload');
    const friendImageUpload = document.getElementById('friend-image-upload');
    const myChemPreview = document.getElementById('my-chem-preview');
    const friendChemPreview = document.getElementById('friend-chem-preview');
    const chemistryAnalyzeBtn = document.getElementById('chemistry-analyze-btn');
    const chemistryResult = document.getElementById('chemistry-result');
    const myUploadBox = document.getElementById('my-upload-box');
    const friendUploadBox = document.getElementById('friend-upload-box');

    const mbtiTypes = ['ENFP', 'ENFJ', 'ENTP', 'ENTJ', 'ESFP', 'ESFJ', 'ESTP', 'ESTJ', 'INFP', 'INFJ', 'INTP', 'INTJ', 'ISFP', 'ISFJ', 'ISTP', 'ISTJ'];

    // ---------------------------------------------------------
    // 1. 개별 분석 로직
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

    analyzeButton.addEventListener('click', () => {
        analyzeButton.textContent = '분석 중...';
        analyzeButton.disabled = true;

        setTimeout(() => {
            // 랜덤 결과 생성 (데모용)
            const randomMBTI = mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)];
            document.querySelector('.mbti-result').textContent = randomMBTI;
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });
            analyzeButton.textContent = '분석 완료!';
        }, 1500);
    });

    // ---------------------------------------------------------
    // 2. 궁합 분석 로직
    // ---------------------------------------------------------

    // 업로드 박스 클릭 시 input 트리거
    myUploadBox.addEventListener('click', () => myImageUpload.click());
    friendUploadBox.addEventListener('click', () => friendImageUpload.click());

    // 이미지 미리보기 공통 함수
    function handleChemUpload(input, previewImg, otherInput) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                previewImg.nextElementSibling.style.display = 'none'; // 아이콘 숨기기
                
                // 두 사진 모두 업로드되었는지 확인
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

    chemistryAnalyzeBtn.addEventListener('click', () => {
        chemistryAnalyzeBtn.textContent = '궁합 분석 중...';
        chemistryAnalyzeBtn.disabled = true;

        setTimeout(() => {
            const myMBTI = mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)];
            const friendMBTI = mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)];
            
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

    // 궁합 점수 계산 로직 (testmoa.com 내용 기반 간소화)
    function calculateCompatibility(m1, m2) {
        // 천생연분 그룹 (주로 상보적 관계)
        const bestPairs = {
            'INFP': ['ENFJ', 'ENTJ'],
            'ENFP': ['INFJ', 'INTJ'],
            'INFJ': ['ENFP', 'ENTP'],
            'ENFJ': ['INFP', 'ISFP'],
            'INTJ': ['ENFP', 'ENTP'],
            'ENTJ': ['INFP', 'INTP'],
            'INTP': ['ENTJ', 'ESTJ'],
            'ENTP': ['INFJ', 'INTJ'],
            'ISFP': ['ENFJ', 'ESFJ', 'ESTJ'],
            'ESFP': ['ISFJ', 'ISTJ'],
            'ISTP': ['ESFJ', 'ESTJ'],
            'ESTP': ['ISFJ', 'ISTJ'],
            'ISFJ': ['ESFP', 'ESTP'],
            'ESFJ': ['ISFP', 'ISTP'],
            'ISTJ': ['ESFP', 'ESTP'],
            'ESTJ': ['INTP', 'ISFP', 'ISTP']
        };

        if (bestPairs[m1]?.includes(m2)) return Math.floor(Math.random() * 11) + 90; // 90-100
        
        // 상성 안좋은 그룹 (반대되는 기능이 많은 경우)
        const worstPairs = {
            'INFP': ['ESTP', 'ISTP'],
            'ENFP': ['ISTJ', 'ESTJ'],
            // ... 생략 (데모용으로 일부만 구현)
        };
        if (worstPairs[m1]?.includes(m2)) return Math.floor(Math.random() * 20) + 20; // 20-40

        // 나머지는 중간 점수
        return Math.floor(Math.random() * 30) + 50; // 50-80
    }

    function getChemDescription(score) {
        if (score >= 90) return "서로의 부족한 점을 채워주는 완벽한 파트너! 관상부터 영혼까지 통하는 천생연분이네요.";
        if (score >= 70) return "함께 있으면 에너지가 넘치는 좋은 관계입니다. 서로의 가치관을 존중하며 즐거운 시간을 보낼 수 있어요.";
        if (score >= 50) return "무난하고 평범한 궁합입니다. 서로 조금씩 맞춰가다 보면 더 깊은 우정을 쌓을 수 있을 거예요.";
        return "관상으로 본 두 분의 기운이 조금 충돌하네요. 서로의 다름을 이해하고 배려하는 노력이 필요해 보입니다.";
    }

    // ---------------------------------------------------------
    // 3. 기타 인터랙션
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
            alert('소중한 의견 감사합니다!');
        });
    });
});
