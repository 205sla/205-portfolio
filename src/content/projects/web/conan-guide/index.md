---
title: 코난 몰아보기 사이트
category: web
cover:
  style: mint
tags:
  - HTML
  - JavaScript
  - jQuery
  - bootstrap
team: 1인 개발
links:
  notion: https://www.notion.so/cd995af667c348f4aab8cf1a2e91c04c
description: 명탐정 코난의 필수 에피소드를 보기 좋게 정리해둔 사이트. 각 에피소드는 **TVING**과 **Laftel**의 링크로 연결됩니다.
---

> 명탐정 코난의 필수 에피소드를 보기 좋게 정리해둔 사이트. 각 에피소드는 **TVING**과 **Laftel**의 링크로 연결됩니다.

코난 검은조직 나오는 에피소드만 보고 싶은데 일일이 찾아보기 귀찮아서 만들었습니다.

- 사이트: https://205sla.github.io/conan/
- 깃허브: https://github.com/205sla/conan

## 개발 일지

웹 개발이 처음이라 간단한 사이트를 빠르게 완성해 보는 것을 목표로 개발을 시작했습니다.

### JSON 데이터 읽기 오류

데이터를 읽기 전에 값에 접근하여 정상적으로 내용이 표시되지 않는 문제가 있었습니다.

```javascript
fetch('conanEpDB.json')
    .then(response => response.json())
    .then(data => {
        conanData = data.Sheet1;
        deiteo_da_ilgeosseoyo(); // 메인함수 실행
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });
```

`fetch()` 함수를 이용해서 데이터를 읽은 후 메인함수를 실행하도록 변경했습니다.

### CORS policy 관련 에러가 발생

서버에서 JSON 파일을 가져오는 것이 아니라 로컬의 파일을 읽는 형태이기 때문에 문제가 발생했습니다. 보안상의 이유로 접근에 차단당한다고 합니다. (예: 로그인 관련 토큰을 수집해 간다든지…)

깃허브 페이지에서는 문제가 없고 로컬에서 테스트할 때만 발생하는 문제라서 **Brackets** 에디터의 라이브 프리뷰 기능을 이용해서 개발 시에도 확인할 수 있도록 개발 도구를 변경했습니다.

### 카카오 브라우저 오류

만든 사이트를 친구에게 전송하고 보니 카카오 브라우저에서는 이미지가 정상적으로 보이지 않는 문제를 발견했습니다. 더 많은 브라우저에 호환되도록 수정하는 방법도 있지만 그냥 카카오 브라우저로 접속 시 크롬이나 사파리로 전환하도록 수정했습니다.

```javascript
var inappdeny_exec_vanillajs = (callback) => {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
}
inappdeny_exec_vanillajs(() => {
    function copytoclipboard(val) {
        var t = document.createElement("textarea");
        document.body.appendChild(t);
        t.value = val;
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
    };

    function inappbrowserout() {
        copytoclipboard(window.location.href);
        alert('URL주소가 복사되었습니다.\n\nSafari가 열리면 주소창을 길게 터치한 뒤, "붙여놓기 및 이동"를 누르면 정상적으로 이용하실 수 있습니다.');
        location.href = 'x-web-search://?';
    };

    var useragt = navigator.userAgent.toLowerCase();
    var target_url = "https://205sla.github.io/conan/";

    if (useragt.match(/kakaotalk/i)) {
        // 카카오톡 외부브라우저로 호출
        location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(target_url);
    } else if (useragt.match(/line/i)) {
        // 라인 외부브라우저로 호출
        if (target_url.indexOf('?') !== -1) {
            location.href = target_url + '&openExternalBrowser=1';
        } else {
            location.href = target_url + '?openExternalBrowser=1';
        }
    }
    // ... (그 외 인앱 브라우저 처리 로직)
});
```

카카오 브라우저 외에도 대부분의 인앱 브라우저로 접속 시 크롬이나 사파리로 전환.

### 공유 기능 제작

```javascript
// 링크 복사
$("#copyLink").on("click", function () {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('ep', mainEpNum + 1);
    const newUrl = currentUrl.toString();

    navigator.clipboard.writeText(newUrl).then(() => {
        showAlertCopySuccess(newUrl);
    }).catch(err => {
        console.error(err);
        console.error("복사 실패");
    });
});
```

복사 버튼을 누르면 url 파라미터를 추가해 해당 에피소드로 연결되는 링크를 생성.

```javascript
// url 파라미터를 이용한 접근 처리
const startUrl = new URLSearchParams(window.location.search);

if (startUrl.has('ep')) {
    var startEp = startUrl.get('ep');
    $('#carouselExampleControls').carousel(Number(startEp) - 1);

    // url 파라미터 지우기
    window.history.pushState(null, window.document.title, "/" + window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split("?")[0]);
} else {
    // 없으면 쿠키로
    try {
        var startEp = getCookie('epCookie');
        $('#carouselExampleControls').carousel(Number(startEp));
    } catch (err) {
        console.log("첫 방문?");
    }
}
```

새로고침 시 1화로 가거나 url 파라미터에 계속 의존하여 최근에 본 에피소드를 반영하지 못하는 문제가 있어, url 파라미터를 통해 접속하면 url 파라미터를 지우고 url 파라미터가 없으면 쿠키를 이용하여 접속하도록 했습니다. 지운 url 파라미터를 적용하면 새로고침되어 원하는 대로 동작하지 않기 때문에 주소창의 값만 수정하도록 개발했습니다.

### 남도일 ↔ 신이치 모드

한국어 더빙판과 일본어 자막판의 제목이 서로 다릅니다.
- 한국판: 복수의 연쇄살인 사건
- 일본판: 오사카 연쇄살인사건

원하는 제목 스타일로 볼 수 있도록 만들었습니다.

```javascript
// 남도일 신이치 모드 변경
$("#btnradio1").on("click", function () {
    isNamdoilMode = true;
    DisplayInformationOnTheScreen(mainEpNum);
});
$("#btnradio2").on("click", function () {
    isNamdoilMode = false;
    DisplayInformationOnTheScreen(mainEpNum);
});
```

