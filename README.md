# gintos frontend

## run

```bash
pnpm run dev
```

## build

```bash
pnpm build
mkdir -p ../gintos/demo/assets/front/dist
mv dist/* ../gintos/demo/assets/front/dist
```

## TODO

## 注意

- Tailwind CSS `!` 在前(强引用，覆盖其他样式)
  - `class="!min-w-[calc(100vw-60vw-268px)] w-full mt-2 px-2 pb-2 bg-bg_color ml-2 overflow-auto"`
