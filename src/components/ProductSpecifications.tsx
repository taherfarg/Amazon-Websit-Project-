'use client';

import { useState, useEffect } from 'react';
import { Cpu, Ruler, Weight, Battery, Palette, Box, Info } from 'lucide-react';

interface SpecificationsProps {
    specifications: {
        technical_details?: Record<string, string>;
        additional_info?: Record<string, string>;
    } | null;
    locale: string;
}

const iconMap: Record<string, React.ElementType> = {
    'dimensions': Ruler,
    'weight': Weight,
    'battery': Battery,
    'color': Palette,
    'processor': Cpu,
    'package': Box,
};

function getIcon(key: string): React.ElementType {
    const lowerKey = key.toLowerCase();
    for (const [keyword, icon] of Object.entries(iconMap)) {
        if (lowerKey.includes(keyword)) return icon;
    }
    return Info;
}

export default function ProductSpecifications({ specifications, locale }: SpecificationsProps) {
    const [mounted, setMounted] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!specifications || (!specifications.technical_details && !specifications.additional_info)) {
        return null;
    }

    const allSpecs = {
        ...specifications.technical_details,
        ...specifications.additional_info
    };

    const specEntries = Object.entries(allSpecs);
    const displaySpecs = showAll ? specEntries : specEntries.slice(0, 8);

    if (!mounted) {
        return (
            <div className="animate-pulse bg-white/5 rounded-2xl h-64" />
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                {locale === 'en' ? 'Specifications' : 'المواصفات'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displaySpecs.map(([key, value], index) => {
                    const IconComponent = getIcon(key);
                    return (
                        <div
                            key={key}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <IconComponent className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{key}</p>
                                <p className="text-sm text-white font-medium truncate">{value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {specEntries.length > 8 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    {showAll
                        ? (locale === 'en' ? 'Show Less' : 'عرض أقل')
                        : (locale === 'en' ? `Show All (${specEntries.length})` : `عرض الكل (${specEntries.length})`)
                    }
                </button>
            )}
        </div>
    );
}
