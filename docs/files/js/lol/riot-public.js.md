# `js/lol/riot-public.js`

파일 역할: LoL 서버 메타데이터와 Data Dragon 버전 조회.

[소스 보기](../../../../js/lol/riot-public.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- REGIONDATA: 지역 이름 및 platform/regional 주소용 값을 보관합니다.
- getVersion(): 공개 버전 목록의 첫 번째 값을 반환합니다.

## 사용처와 수정 시 확인할 점

LoL 페이지가 프로필 아이콘 URL을 만들 때 사용합니다. 목록에 지역이 있어도 현재 검색 폼과 로컬 서버가 허용하는 지역은 KR/JP/NA/EUW입니다.
