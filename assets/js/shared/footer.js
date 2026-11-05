/* 공통 하단 저작권 영역 생성. 파일 설명: docs/files/js/shared/footer.js.md */
const Footer = () => {
  return `
        <a class="wordmark" href="../../index.html">
            poro<span>.gg</span>
        </a>
        <p>당신의 다음 한 수를 위해.<small>PORO.GG is not endorsed by Riot Games. Game assets © Riot Games.</small></p>
        <span>TEAM PROJECT · TFT PROTOTYPE</span>
    `;
};

document.querySelector("#footer").innerHTML = Footer();
