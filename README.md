# 잇츠마인 주문 관리 - 구글 로그인 + 영구 저장

이 폴더는 **실제 배포에 필요한 코드**입니다. Firebase 계정/프로젝트가 아직 연결되지 않았으므로, 내려받은 파일을 열기만 해서는 로그인이 되지 않습니다.

## 1. Firebase 설정
1. https://console.firebase.google.com/ 에서 프로젝트를 생성합니다.
2. Authentication > Sign-in method > Google 을 사용 설정합니다. 승인된 도메인에 실제 배포 도메인을 등록합니다.
3. Firestore Database 를 생성합니다(프로덕션 모드). `firestore.rules` 내용을 Firestore > 규칙에 붙여넣고 게시합니다.
4. 프로젝트 설정 > 내 앱 > 웹 앱 등록 후 표시된 `firebaseConfig` 값을 `firebase-config.js`에 입력합니다. 이 설정값은 공개 클라이언트 정보이며 비밀키가 아닙니다.
5. **관리자 본인만 이용하는 경우** Google 로그인을 활성화한 뒤에도 Firebase Authentication의 로그인 허용 정책/보안 규칙을 본인 계정만 허용하도록 수정하는 것이 좋습니다. 현재 규칙은 각 로그인 계정이 자기 주문 기록만 읽고 쓰도록 격리합니다.

## 2. 웹사이트 배포
Firebase Hosting 또는 Netlify, Vercel 등에 이 폴더의 `index.html`, `cloud.js`, `firebase-config.js`를 같은 경로로 배포합니다. 로컬 `file://` 더블클릭 대신 HTTPS 웹사이트로 접속하세요. Firebase Hosting 예: `firebase init hosting` 시 공개 폴더에 이 세 파일을 두고 `firebase deploy --only hosting` 실행.

## 3. 최초 주문 가져오기
로그인 후 데이터가 비어 있을 때만 `기존 주문 272건 가져오기` 버튼이 표시됩니다. 한 번 누르면 원본 주문 272건을 해당 구글 계정 Firestore에 저장합니다. 그 뒤에는 수정/추가/상태 변경이 자동 저장됩니다. 다른 PC·휴대폰에서 같은 구글 계정으로 로그인하면 같은 데이터를 봅니다.

## 주의
- 현재 데이터는 사용자별 **하나의 문서**에 저장하므로 여러 기기에서 동시에 편집하면 마지막 저장이 우선할 수 있습니다. 한 번에 한 기기에서 편집하는 것을 권장합니다.
- 모든 주문 금액 계산은 기존 웹앱과 같은 로직입니다. CSV/JSON 백업 기능은 계속 사용하세요.
- 연결이 끊겼을 때 Firestore SDK의 오프라인 큐가 일부 변경을 일시 보관할 수 있지만, 화면에 '클라우드 저장됨'이 표시되기 전까지 영구 저장을 보장할 수 없습니다.
- **이 ZIP 자체는 호스팅되거나 Firebase 프로젝트가 생성된 것이 아닙니다.**
