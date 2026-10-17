# 요청사항

0. 모바일 앱으로 옮겨서 다운받아서 모바일로만 확인하니까 확인작업이 너무 오래걸려 웹같은 걸로 바로바로 확인할 수 있게도 작업할 수 있나? 그리고 최종 컨펌이 나면 모바일로 넘겨서 최종 확인해보는 방식으로

1. 홈 화면

- 상단 왼쪽 invalid date 글자 없애줘
- 오늘도 작은 행복을 기다려요 -> 일상에 작은 행복 같이 피워보아요
- 나의 나무는 더 큰 크기로 보여줘 홈 화면의 절반정도가 나무가 자라는걸 시각화해서 보여졌으면 좋겠어.

2. 심기 화면

- 심기->지뢰 하단 bar 이름변경
- 언제 터뜨릴까요? 에서 1시간 뒤를 지정했는데도 '이미 지난 시간이에요'라고 뜨고, 12시간 뒤를 해도 '이미 지난 시간이에요'라고 떠 오류 수정해줘.
- 그리고 시간 지정할 때 UI를 시계가 뜨는 UI말고 왼쪽칸에 시간 오른쪽칸에 분을 적을 수 있는 두개의 칸으로 설정해줘 각 칸마다 손가락으로 드래그하면 간단히 몇시 몇분을 조절할 수 있게도 해주고.

3. 기록
   기록부분은 누르자마자 오류가 떠 아래 확인하고 수정
   Render Error

invalid array length

Source:
C:\Users\YG\Desktop\AI Study\happymine\src\components\month-calendar.tsx (28:39)

Call Stack:
MonthCalendar (C:\Users\YG\Desktop\AI Study\happymine\src\components\month-calendar.tsx:28)
callComponent.react_stack_bottom_frame (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:17130)
renderWithHooks (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:5648)
updateFunctionComponent (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:8081)
beginWork (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:9340)
runWithFiberInDEV (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:697)
performUnitOfWork (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:14134)
workLoopSync (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:13966)
renderRootSync (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:13947)
performWorkOnRoot (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:13160)
performSyncWorkOnRoot (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:3688)
flushSyncWorkAcrossRoots_impl (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:3538)
processRootScheduleInMicrotask (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:3570)
scheduleMicrotask$argument_0 (C:\Users\YG\Desktop\AI Study\happymine\node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js:3708)
