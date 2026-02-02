import React, { useState } from 'react';
import { createOpenAIService, createGeminiService } from '../services/aiService';
import { generateContentPrompt } from '../utils/xhsPrompts';

interface XHSContentExpanderProps {
    apiKey?: string;
    provider?: 'openai' | 'gemini';
    userCredits?: number;
    onCreditUpdate?: (newCredits: number) => void;
}

export const XHSContentExpander: React.FC<XHSContentExpanderProps> = ({
    apiKey = '',
    provider = 'openai',
    userCredits = 3,
    onCreditUpdate,
}) => {
    const [title, setTitle] = useState('');
    const [outline, setOutline] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!title.trim()) {
            setError('请输入标题');
            return;
        }

        if (!outline.trim()) {
            setError('请输入大纲或要点');
            return;
        }

        if (userCredits <= 0) {
            setError('使用次数已用完，请升级会员或购买次数');
            return;
        }

        setLoading(true);
        setError('');
        setContent('');

        try {
            const aiService = provider === 'gemini'
                ? createGeminiService(apiKey)
                : createOpenAIService(apiKey);

            const prompt = generateContentPrompt(title, outline);
            const result = await aiService.generateCompletion(prompt);

            setContent(result);

            if (onCreditUpdate) {
                onCreditUpdate(userCredits - 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
            console.error('Content generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const wordCount = content.length;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 头部 */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
                    ✍️ 小红书文案扩写器
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    输入标题和大纲，AI 自动扩写成完整的小红书文案
                </p>
            </div>

            {/* 使用次数 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <span className="text-gray-700 dark:text-gray-300">
                            剩余次数：
                            <span className="font-bold text-purple-600 dark:text-purple-400 text-xl ml-1">
                                {userCredits}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 输入区域 */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        笔记标题
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="例如：30天瘦20斤的减肥方法"
                        disabled={loading}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        大纲/要点 <span className="text-gray-400">（每行一个要点）</span>
                    </label>
                    <textarea
                        value={outline}
                        onChange={(e) => setOutline(e.target.value)}
                        placeholder="例如：&#10;- 早上空腹喝水&#10;- 三餐怎么吃&#10;- 运动计划&#10;- 我的真实效果"
                        disabled={loading}
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 dark:focus:border-purple-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    />
                </div>
            </div>

            {/* 生成按钮 */}
            <button
                onClick={handleGenerate}
                disabled={loading || !title.trim() || !outline.trim() || userCredits <= 0}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚡</span>
                        AI 正在创作中...
                    </span>
                ) : (
                    '🚀 一键生成完整文案'
                )}
            </button>

            {/* 错误提示 */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    ⚠️ {error}
                </div>
            )}

            {/* 生成结果 */}
            {content && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            ✨ 生成的文案
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                共 {wordCount} 字
                            </span>
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                            >
                                {copied ? '✓ 已复制' : '📋 复制全文'}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed">
                                {content}
                            </pre>
                        </div>
                    </div>

                    {/* 使用提示 */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            💡 <strong>使用建议：</strong>生成的文案可以直接使用，也可以根据你的实际情况适当调整，让内容更真实自然！
                        </p>
                    </div>
                </div>
            )}

            {/* 示例 */}
            {!content && !loading && (
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">
                        🌟 生成示例
                    </h4>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <p><strong>标题：</strong>"30天瘦20斤的减肥方法"</p>
                            <p><strong>大纲：</strong></p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>早上空腹喝水</li>
                                <li>三餐怎么吃</li>
                                <li>运动计划</li>
                                <li>我的真实效果</li>
                            </ul>
                        </div>
                        <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <strong>输出：</strong>完整的 300-600 字小红书文案，包含 emoji、分段、互动引导等
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
