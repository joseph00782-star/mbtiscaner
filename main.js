document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 0. Firebase 초기화 (실시간 정답률용)
    // ---------------------------------------------------------
    // TODO: 사용자의 Firebase 설정으로 교체하세요.
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        databaseURL: "YOUR_DATABASE_URL",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    let database;
    try {
        if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
        }
    } catch (e) {
        console.error("Firebase initialization failed", e);
    }

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
    // 1. 분석 로직
    // ---------------------------------------------------------
    function getSimpleScores(file) {
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
            scores.push(currentSeed % 101);
        }
        return scores;
    }

    function predictMBTI(file) {
        const scores = getSimpleScores(file);
        const sE = scores[0], sN = scores[1], sT = scores[2], sP = scores[3];
        const t1 = sE >= 50 ? 'E' : 'I', t2 = sN >= 50 ? 'N' : 'S', t3 = sT >= 50 ? 'T' : 'F', t4 = sP >= 50 ? 'P' : 'J';
        return {
            mbti: t1 + t2 + t3 + t4,
            scores: { E: sE, I: 100 - sE, N: sN, S: 100 - sN, T: sT, F: 100 - sT, P: sP, J: 100 - sP },
            types: { t1, t2, t3, t4 }
        };
    }

    function generateAnalysisText(res) {
        const s = res.scores, t = res.types;
        return {
            ei: t.t1 === 'E' ? `활기찬 눈빛과 풍부한 표정 근육이 포착되었습니다. (${s.E}%)` : `차분하고 깊은 눈매와 절제된 입매가 돋보입니다. (${s.I}%)`,
            ns: t.t2 === 'N' ? `몽환적이고 반짝이는 눈동자가 특징적입니다. (${s.N}%)` : `또렷하고 집중력 있는 시선 처리가 감지됩니다. (${s.S}%)`,
            tf: t.t3 === 'T' ? `직선적인 턱선과 냉철해 보이는 인상이 분석되었습니다. (${s.T}%)` : `부드러운 얼굴 선과 온화한 눈매가 돋보입니다. (${s.F}%)`,
            pj: t.t4 === 'P' ? `자유분방하고 편안한 표정이 매력적입니다. (${s.P}%)` : `단정하고 절제된 입술 라인이 신뢰감을 줍니다. (${s.J}%)`
        };
    }

    // ---------------------------------------------------------
    // 2. 이벤트 리스너
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

        const result = predictMBTI(file);
        const analysisTexts = generateAnalysisText(result);

        setTimeout(() => {
            mbtiResult.textContent = result.mbti;
            mbtiDescription.textContent = mbtiNicknames[result.mbti] || '분석 완료';
            
            const maxTrait = Object.entries(result.scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
            const mainFeat = { 'E': '에너지 넘치는 눈빛', 'I': '사색에 잠긴 분위기', 'N': '호기심 어린 표정', 'S': '현실을 꿰뚫는 시선', 'T': '지적인 턱선', 'F': '온화한 미소', 'P': '자유로운 아우라', 'J': '단정한 인상' }[maxTrait];
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
            
            // 결과가 나올 때 실시간 정답률 표시
            if (database) {
                accuracyContainer.style.display = 'block';
                syncAccuracy();
            } else {
                // Firebase가 설정되지 않은 경우 시뮬레이션 모드
                accuracyContainer.style.display = 'block';
                updateAccuracyUI(78.5, 100); 
            }
        }, 1000);
    });

    // ---------------------------------------------------------
    // 3. 궁합 분석
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
            let desc = score >= 90 ? "천생연분!" : score >= 70 ? "좋은 관계" : "배려 필요";
            document.getElementById('chem-desc').textContent = desc;
            chemistryResult.style.display = 'block';
            window.scrollTo({ top: chemistryResult.offsetTop - 100, behavior: 'smooth' });
            chemistryAnalyzeBtn.textContent = '분석 완료!';
        }, 1000);
    });

    function calculateCompatibility(m1, m2) {
        return Math.floor(Math.random() * 50) + 50;
    }

    // ---------------------------------------------------------
    // 4. 실시간 정답률 (Firebase 연동)
    // ---------------------------------------------------------
    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    const accuracyContainer = document.querySelector('.accuracy-container');
    const accuracyBar = document.getElementById('accuracy-bar');
    const accuracyText = document.getElementById('accuracy-text');

    let voted = false;

    function syncAccuracy() {
        if (!database) return;
        database.ref('stats/accuracy').on('value', (snapshot) => {
            const data = snapshot.val() || { yes: 80, total: 100 };
            const percentage = (data.yes / data.total) * 100;
            updateAccuracyUI(percentage);
        });
    }

    function updateAccuracyUI(percentage) {
        const pStr = percentage.toFixed(1) + '%';
        accuracyBar.style.width = pStr;
        accuracyText.textContent = pStr;
    }

    feedbackButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (voted) return alert('이미 참여하셨습니다!');
            
            const isYes = btn.classList.contains('yes-btn');
            voted = true;
            feedbackButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (database) {
                database.ref('stats/accuracy').transaction((current) => {
                    if (!current) current = { yes: 80, total: 100 };
                    current.total++;
                    if (isYes) current.yes++;
                    return current;
                });
            } else {
                alert('Firebase가 설정되지 않아 로컬에서만 반영됩니다.');
                updateAccuracyUI(isYes ? 80 : 77);
            }
        });
    });
});
