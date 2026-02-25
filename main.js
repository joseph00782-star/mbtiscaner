
document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const placeholderText = document.getElementById('placeholder-text');
    const analyzeButton = document.getElementById('analyze-button');
    const resultSection = document.getElementById('result-section');

    // 이미지 업로드 시 미리보기
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                placeholderText.style.display = 'none';
                analyzeButton.disabled = false; // 분석 버튼 활성화
            };
            reader.readAsDataURL(file);
        }
    });

    // 분석 시작 버튼 클릭 이벤트
    analyzeButton.addEventListener('click', () => {
        // 나중에 여기에 AI 분석 로직 추가
        // 지금은 임시로 결과 섹션을 보여주는 애니메이션 효과만 적용
        analyzeButton.textContent = '분석 중...';
        analyzeButton.disabled = true;

        setTimeout(() => {
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });
            analyzeButton.textContent = '분석 완료!';
        }, 2000); // 2초 후 결과 표시 (애니메이션 시간)
    });

    // 궁합 분석 버튼 (기능은 추후 구현)
    const chemistryButton = document.querySelector('.chemistry-button');
    chemistryButton.addEventListener('click', () => {
        alert('궁합 분석 기능은 곧 업데이트될 예정입니다!');
    });
    
    // 결과 공유 버튼 (기능은 추후 구현)
    const shareButton = document.querySelector('.share-button');
    shareButton.addEventListener('click', () => {
        alert('인스타그램 스토리 공유 기능은 곧 업데이트될 예정입니다!');
    });

    // 피드백 버튼 이벤트
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
