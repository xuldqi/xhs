import React, { useState } from 'react';
import { createOpenAIService, createGeminiService } from '../services/aiService';
import { generateTitlePrompt } from '../utils/xhsPrompts';

interface XHSTitleGeneratorProps {
    apiKey?: string;
    provider?: 'openai' | 'gemini';
    userCredits?: number;
    onCreditUpdate?: (newCredits: number) => void;
}

export const XHSTitleGenerator: React.FC<XHSTitleGeneratorProps> = ({
    apiKey = '',
    provider = 'openai',
    userCredits = 3,
    onCreditUpdate,
}) => {
    const [topic, setTopic] = useState('');
    const [titles, setTitles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('请输入主题或关键词');
            return;
        }

        if (userCredits <= 0) {
            setError('使用次数已用完，请升级会员或购买次数');
            return;
        }

        setLoading(true);
        setError('');
        setTitles([]);

        try {
            // 创建 AI 服务实例
            const aiService = provider === 'gemini'
                ? createGeminiService(apiKey)
                : createOpenAIService(apiKey);

            // 生成标题
            const prompt = generateTitlePrompt(topic);
            const result = await aiService.generateJSON<string[]>(prompt);

            setTitles(result);

            // 扣除使用次数
            if (onCreditUpdate) {
                onCreditUpdate(userCredits - 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
            console.error('Title generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (title: string, index: number) => {
        navigator.clipboard.writeText(title);
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-3">
                    📝 小红书爆款标题生成器
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    AI 一键生成吸睛标题，助你打造 10w+ 爆款笔记
                </p>
            </div>

            {/* 使用次数显示 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <span className="text-gray-700 dark:text-gray-300">
                            剩余次数：
                            <span className="font-bold text-pink-600 dark:text-pink-400 text-xl ml-1">
                                {userCredits}
                            </span>
                        </span>
                    </div>
                    {userCredits <= 0 && (
                        <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                            升级 VIP
                        </button>
                    )}
                </div>
            </div>

            {/* 输入区域 */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输入主题或关键词
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="例如：减肥方法、护肤技巧、穿搭灵感..."
                        disabled={loading}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-pink-500 dark:focus:border-pink-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    />
                    {topic && (
                        <button
                            onClick={() => setTopic('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* 生成按钮 */}
            <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim() || userCredits <= 0}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mb-6"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚡</span>
                        AI 正在生成中...
                    </span>
                ) : (
                    '🚀 一键生成爆款标题'
                )}
            </button>

            {/* 错误提示 */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    ⚠️ {error}
                </div>
            )}

            {/* 结果展示 */}
            {titles.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        ✨ 为你生成了 {titles.length} 个爆款标题：
                    </h3>
                    {titles.map((title, index) => (
                        <div
                            key={index}
                            className="group p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-pink-300 dark:hover:border-pink-600 transition-all cursor-pointer"
                            onClick={() => handleCopy(title, index)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-pink-500">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                                        {title}
                                    </p>
                                </div>
                                <button
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                                >
                                    {copiedIndex === index ? '✓ 已复制' : '📋 复制'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* 使用提示 */}
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            💡 <strong>使用技巧：</strong>点击标题即可一键复制，可以多生成几次，选择最符合你内容的标题使用！
                        </p>
                    </div>
                </div>
            )}

            {/* 示例展示 */}
            {titles.length === 0 && !loading && (
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">
                        🌟 生成示例
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>• <strong>输入：</strong>"减肥方法"</p>
                        <p className="pl-4">
                            <strong>输出：</strong>"30天甩肉20斤！这个方法我真的绝了🔥"
                        </p>
                        <p className="pl-4">"姐妹们！这样减肥真的不反弹（附食谱）✨"</p>
                    </div>
                </div>
            )}
        </div>
    );
};
