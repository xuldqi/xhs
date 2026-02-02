import React, { useState } from 'react';
import { createOpenAIService, createGeminiService } from '../services/aiService';
import { generateCoverTextPrompt } from '../utils/xhsPrompts';

interface XHSCoverTextSuggesterProps {
    apiKey?: string;
    provider?: 'openai' | 'gemini';
    userCredits?: number;
    onCreditUpdate?: (newCredits: number) => void;
}

export const XHSCoverTextSuggester: React.FC<XHSCoverTextSuggesterProps> = ({
    apiKey = '',
    provider = 'openai',
    userCredits = 3,
    onCreditUpdate,
}) => {
    const [title, setTitle] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!title.trim()) {
            setError('请输入笔记标题');
            return;
        }

        if (userCredits <= 0) {
            setError('使用次数已用完，请升级会员或购买次数');
            return;
        }

        setLoading(true);
        setError('');
        setSuggestions([]);

        try {
            const aiService = provider === 'gemini'
                ? createGeminiService(apiKey)
                : createOpenAIService(apiKey);

            const prompt = generateCoverTextPrompt(title);
            const result = await aiService.generateJSON<string[]>(prompt);

            setSuggestions(result);

            if (onCreditUpdate) {
                onCreditUpdate(userCredits - 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
            console.error('Cover text generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 头部 */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-3">
                    🎨 小红书封面文字生成器
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    生成适合做封面的醒目短句，让你的笔记更吸睛
                </p>
            </div>

            {/* 使用次数 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <span className="text-gray-700 dark:text-gray-300">
                            剩余次数：
                            <span className="font-bold text-orange-600 dark:text-orange-400 text-xl ml-1">
                                {userCredits}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 输入区域 */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    笔记标题
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="例如：30天瘦20斤的减肥方法"
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
            </div>

            {/* 生成按钮 */}
            <button
                onClick={handleGenerate}
                disabled={loading || !title.trim() || userCredits <= 0}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚡</span>
                        AI 正在生成中...
                    </span>
                ) : (
                    '🚀 生成封面文字'
                )}
            </button>

            {/* 错误提示 */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    ⚠️ {error}
                </div>
            )}

            {/* 结果展示 */}
            {suggestions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        ✨ 为你生成了 {suggestions.length} 个封面文字：
                    </h3>

                    <div className="grid gap-4">
                        {suggestions.map((text, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden"
                            >
                                {/* 预览卡片 */}
                                <div className="relative p-8 bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 rounded-2xl border-2 border-orange-200 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all cursor-pointer">
                                    {/* 封面文字预览 */}
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-gray-800 dark:text-gray-100 leading-tight">
                                            {text}
                                        </p>
                                    </div>

                                    {/* 悬停时显示复制按钮 */}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCopy(text, index)}
                                            className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
                                        >
                                            {copiedIndex === index ? '✓ 已复制' : '📋 复制'}
                                        </button>
                                    </div>

                                    {/* 序号标签 */}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                                            #{index + 1}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 使用提示 */}
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            💡 <strong>使用技巧：</strong>选择最吸睛的文字，用设计工具添加到封面图上。字体建议使用加粗、大字号，颜色要与背景形成对比！
                        </p>
                    </div>
                </div>
            )}

            {/* 示例 */}
            {suggestions.length === 0 && !loading && (
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">
                        🌟 生成示例
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <strong>输入：</strong>"30天瘦20斤的减肥方法"
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-4 bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 rounded-lg">
                                    <p className="text-lg font-bold text-center text-gray-800 dark:text-gray-100">
                                        30天瘦20斤 🔥
                                    </p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 rounded-lg">
                                    <p className="text-lg font-bold text-center text-gray-800 dark:text-gray-100">
                                        真的瘦了！
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
