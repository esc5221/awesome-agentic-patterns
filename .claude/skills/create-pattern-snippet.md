# Create Pattern Snippet

원본 `patterns/*.md` → `pattern-snippets/` HTML 스니펫 변환

---

## 1. 프로젝트 구조

```
pattern-snippets/
├── patterns/
│   ├── _template/      # 새 패턴용 템플릿 (복사해서 사용)
│   │   ├── meta.json
│   │   ├── card.html
│   │   ├── ko.json
│   │   └── en.json
│   │
│   └── {pattern-id}/   # 각 패턴 폴더
│       ├── meta.json   # 메타데이터
│       ├── card.html   # HTML 카드 (코드/다이어그램)
│       ├── ko.json     # 한국어 텍스트
│       └── en.json     # 영어 텍스트
│
├── build.js            # node build.js로 빌드
├── loader.js           # 개발 시 패턴 목록 추가 필요
└── dev.html            # 개발용 (새로고침으로 확인)
```

---

## 2. 새 패턴 추가 절차

```bash
# 1. 템플릿 복사
cp -r pattern-snippets/patterns/_template pattern-snippets/patterns/{pattern-id}

# 2. 4개 파일 수정
#    - meta.json: id, title, category, order
#    - card.html: 다이어그램, 코드
#    - ko.json, en.json: 텍스트

# 3. loader.js 패턴 목록 추가
#    getPatternList() 배열에 '{pattern-id}' 추가

# 4. 확인 & 빌드
#    dev.html 새로고침 또는 node build.js
```

---

## 3. 파일 형식

### meta.json

```json
{
  "id": "pattern-id",
  "title": "Pattern Title",
  "category": "Orchestration | Feedback | Collaboration",
  "order": 1
}
```

### ko.json / en.json

```json
{
  "category": "카테고리명",
  "problem": "문제 설명 1-2문장",
  "solution": "해결책 1-2문장",
  "when": ["조건 1", "조건 2", "조건 3"],
  "pros": ["장점 1", "장점 2"],
  "cons": ["단점 1", "단점 2"]
}
```

### card.html

`patterns/_template/card.html` 참조. 핵심 구조:
- `data-pattern="{id}"` - 패턴 ID
- `data-i18n="{key}"` - 다국어 텍스트 (problem, solution, when, pros, cons)
- 코드/다이어그램은 언어 무관하게 HTML에 직접 작성

---

## 4. 원본 → 스니펫 변환 규칙

| 원본 (md) | 스니펫 | 압축 |
|----------|--------|------|
| title (YAML) | meta.json `title` | - |
| category (YAML) | meta.json `category` | - |
| ## Problem | ko/en.json `problem` | 1-2문장 |
| ## Solution | ko/en.json `solution` | 1-2문장 |
| ## How to use it | ko/en.json `when` | 3-4개 bullet |
| ## Trade-offs | ko/en.json `pros`, `cons` | 각 2-3개 |
| ```mermaid | card.html `.mermaid` | 원본 복사 |
| ```python | card.html `.code-box` | 대표 1개, 10줄 이내 |

---

## 5. ASCII 다이어그램

### 수평 흐름 스타일

```
Main ──▶ Split(n) ────┼─── Sub2 ──▶ [████] ───┼──▶ Merge ──▶ Done
```

### 기본 기호

```
──▶  화살표     ├┼┤  분기점
───  연결선     [ ]  노드
┌┐└┘ 코너       ████ 작업 블록
```

### 주의

- `₁₂₃` subscript 금지 → `Sub1`, `Sub2`
- 이모지: `<span class="emoji">⌛</span>`

---

## 6. 체크리스트

- [ ] `patterns/{id}/` 4개 파일 생성
- [ ] `loader.js` 패턴 목록 추가
- [ ] Problem/Solution 1-2문장
- [ ] When to use 3-4개
- [ ] Pros/Cons 각 2-3개
- [ ] 코드 10줄 이내
- [ ] ASCII 수평 스타일
- [ ] ko.json, en.json 둘 다 완성

---

## 7. 변환 상태 확인

```bash
# 변환 안 된 패턴 목록 출력
./pattern-snippets/check-todo.sh
```

결과 예시:
```
TODO: patterns/context-window-management.md
TODO: patterns/tool-use-patterns.md
...
```

---

## 참조

- 템플릿: `pattern-snippets/patterns/_template/`
- 예시: `pattern-snippets/patterns/sub-agent-spawning/`
- 스타일: `pattern-snippets/styles.css`
