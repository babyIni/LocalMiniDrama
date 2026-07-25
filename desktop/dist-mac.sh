#!/bin/bash
# macOS 打包脚本（完整版 + 纯净版 DMG）
# 用法：在 desktop/ 目录下执行 bash dist-mac.sh
# 或先授权：chmod +x dist-mac.sh && ./dist-mac.sh

set -e

# 使用国内镜像加速 Electron 下载
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_BUILDER_BINARIES_MIRROR="https://cdn.npmmirror.com/binaries/electron-builder-binaries/"

# 禁用 macOS 代码签名（无证书时跳过签名流程）
export CSC_IDENTITY_AUTO_DISCOVERY=false

# 切换到 desktop 目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 清理前一次打包残留的磁盘挂载点
clean_mounts() {
  # 清除所有 LocalMiniDrama 相关的磁盘挂载
  hdiutil info 2>/dev/null | grep -i 'LocalMiniDrama' | while read -r line; do
    local dev=$(echo "$line" | awk '{print $1}')
    if [ -n "$dev" ]; then
      hdiutil detach -force "$dev" 2>/dev/null || true
    fi
  done
  # 额外清理常见的 disk 编号
  for dev in /dev/disk{2,3,4,5,6,7,8}; do
    hdiutil detach -force "$dev" 2>/dev/null || true
  done
}

# 确保前端构建好
if [ ! -d "../frontweb/dist" ]; then
  npm run build:front
fi

echo ""
echo "========== [1/2] 构建完整版（含示例资源）=========="
echo ""

clean_mounts
npm run prepare-backend
npm run copy-front
npx electron-builder --mac --config electron-builder-mac.json

echo ""
echo "========== [2/2] 构建纯净版（不含示例资源）=========="
echo ""

clean_mounts
npx electron-builder --mac --config electron-builder-mac-lite.json

echo ""
echo "========== 全部构建完成 =========="
echo "输出目录：release/"
echo "  完整版（Intel）：LocalMiniDrama-x.x.x-mac-x64.dmg"
echo "  完整版（ARM）  ：LocalMiniDrama-x.x.x-mac-arm64.dmg"
echo "  纯净版（Intel）：LocalMiniDrama-Lite-x.x.x-mac-x64.dmg"
echo "  纯净版（ARM）  ：LocalMiniDrama-Lite-x.x.x-mac-arm64.dmg"
echo ""
