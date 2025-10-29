# Usage

## Step 1
Copy all file into widget project root path except me.


## Step 2
```
"vite:start": "vite",
"vite:build": "set __DEV_VITEJS__=true && npm run build",
```

`npm run vite:start`启动开发
`npm run vite:build`build widget skip runtime code, leave it in runtime fetch from vite server
