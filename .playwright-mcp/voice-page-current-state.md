### New console messages
- [ERROR] React has detected a change in the order of Hooks called by %s. This will lead to bugs and e...
- [ERROR] %o

%s Error: Rendered more hooks than during the previous render.
    at updateWorkInProgre...
- [LOG] [useVoiceSession] ========== useEffect CLEANUP (UNMOUNT) ========== @ http://localhost:3000/_n...
- [ERROR] App Error: Error: Rendered more hooks than during the previous render.
    at updateWorkInPr...
- [ERROR] App Error: Error: Rendered more hooks than during the previous render.
    at updateWorkInPr...

### Page state
- Page URL: http://localhost:3000/reading/voice
- Page Title: Voice Reading | Tarot Reading
- Page Snapshot:
```yaml
- generic [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [active] [ref=e3]:
    - generic [ref=e118]:
      - generic [ref=e119]: ⚠️
      - heading "Something went wrong" [level=2] [ref=e120]
      - paragraph [ref=e121]: Rendered more hooks than during the previous render.
      - button "Try again" [ref=e122]
  - generic [ref=e8]:
    - img [ref=e10]
    - button "Open Tanstack query devtools" [ref=e58] [cursor=pointer]:
      - img [ref=e59]
  - generic [ref=e111] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e112]:
      - img [ref=e113]
    - generic [ref=e123]:
      - button "Open issues overlay" [ref=e124]:
        - generic [ref=e125]:
          - generic [ref=e126]: "1"
          - generic [ref=e127]: "2"
        - generic [ref=e128]:
          - text: Issue
          - generic [ref=e129]: s
      - button "Collapse issues badge" [ref=e130]:
        - img [ref=e131]
  - alert [ref=e116]
```
