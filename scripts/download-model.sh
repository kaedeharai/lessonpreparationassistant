#!/bin/bash

# OpenClaw 模型下载脚本
# 使用前请确保已安装 Ollama 或 OpenClaw

echo "================================"
echo "  OpenClaw 模型下载工具"
echo "================================"
echo ""

# 检测Ollama是否安装
if command -v ollama &> /dev/null; then
    echo "✅ 检测到 Ollama"
    echo ""
    echo "正在下载 OpenClaw 模型..."
    ollama pull openclaw:latest
    
    echo ""
    echo "✅ 下载完成！可用模型列表："
    ollama list
    
elif command -v openclaw &> /dev/null; then
    echo "✅ 检测到 OpenClaw CLI"
    echo ""
    echo "正在下载模型..."
    openclaw download
    
    echo ""
    echo "✅ 下载完成！"
else
    echo "❌ 未检测到 Ollama 或 OpenClaw"
    echo ""
    echo "请先安装以下任一工具："
    echo ""
    echo "1. Ollama (推荐):"
    echo "   curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    echo "2. 或者访问 OpenClaw 官方文档安装"
    echo ""
    exit 1
fi

echo ""
echo "================================"
echo "现在可以启动服务了："
echo "  ollama serve           # 启动Ollama服务"
echo "  ollama run openclaw    # 测试模型"
echo "================================"