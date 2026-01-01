'use client';

import { motion } from 'framer-motion';

export default function ProductCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-full flex flex-col bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
        >
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* Top Badges Skeleton */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <div className="h-6 w-16 rounded-full bg-white/5 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-white/5 animate-pulse" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
            </div>

            {/* Image Area Skeleton */}
            <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-white/5 to-transparent p-8 flex items-center justify-center">
                <div className="w-32 h-32 rounded-2xl bg-white/5 animate-pulse" />
            </div>

            {/* Content Area Skeleton */}
            <div className="p-6 flex flex-col flex-grow relative bg-gradient-to-b from-transparent to-black/20">
                {/* Rating Skeleton */}
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-4 w-12 rounded bg-white/5 animate-pulse" />
                    <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
                </div>

                {/* Title Skeleton */}
                <div className="mb-3 space-y-2">
                    <div className="h-5 w-full rounded bg-white/5 animate-pulse" />
                    <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2 mb-6">
                    <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
                    <div className="h-3 w-5/6 rounded bg-white/5 animate-pulse" />
                </div>

                {/* Footer Skeleton */}
                <div className="mt-auto pt-5 border-t border-white/5 flex justify-between items-center">
                    <div className="space-y-1">
                        <div className="h-3 w-12 rounded bg-white/5 animate-pulse" />
                        <div className="h-6 w-20 rounded bg-white/5 animate-pulse" />
                    </div>
                    <div className="h-10 w-24 rounded-xl bg-white/5 animate-pulse" />
                </div>
            </div>
        </motion.div>
    );
}
