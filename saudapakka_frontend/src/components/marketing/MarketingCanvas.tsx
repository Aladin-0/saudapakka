'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { toBlob } from 'html-to-image';
import { Download, Share2, Check, Loader2, AlertCircle, Sparkles, Building2, Leaf, Crown, Minus } from 'lucide-react';
import { RichTemplate, MarketingPropertyInput } from './RichTemplate';

// ============================================================================
// TYPES
// ============================================================================

interface MarketingCanvasProps {
    property: MarketingPropertyInput;
    template?: 'elegant' | 'urban' | 'nature' | 'prestige' | 'minimal';
}

type TemplateId = 'elegant' | 'urban' | 'nature' | 'prestige' | 'minimal';

interface TemplateStyle {
    id: TemplateId;
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TEMPLATE_STYLES: readonly TemplateStyle[] = [
    { id: 'elegant', name: 'Elegant', icon: Sparkles, color: '#C77D58' },
    { id: 'urban', name: 'Urban', icon: Building2, color: '#1E3A5F' },
    { id: 'nature', name: 'Nature', icon: Leaf, color: '#7A9B76' },
    { id: 'prestige', name: 'Prestige', icon: Crown, color: '#1A1A1A' },
    { id: 'minimal', name: 'Minimal', icon: Minus, color: '#3B7EA1' },
];

const MOBILE_BREAKPOINT = 768;
const TEMPLATE_SIZE = 1080;
const DEBOUNCE_DELAY = 150;

// ============================================================================
// UTILITY HOOKS
// ============================================================================

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        checkMobile();

        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkMobile, DEBOUNCE_DELAY);
        };

        let timeoutId: NodeJS.Timeout;
        window.addEventListener('resize', debouncedResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedResize);
        };
    }, []);

    return isMobile;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MarketingCanvas({ property, template = 'elegant' }: MarketingCanvasProps) {
    // Refs
    const templateRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [selectedStyle, setSelectedStyle] = useState<TemplateId>(template);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [scale, setScale] = useState(0.5);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    // Custom hooks
    const isMobile = useIsMobile();

    // Derived state
    const currentTemplate = useMemo(
        () => TEMPLATE_STYLES.find(t => t.id === selectedStyle),
        [selectedStyle]
    );

    const canGenerate = useMemo(
        () => !isGenerating && imagesLoaded,
        [isGenerating, imagesLoaded]
    );

    const availableImages = useMemo(() => {
        const images = property?.images || [];
        return images.slice(0, 8); // Limit to max 8 images
    }, [property?.images]);

    const hasMultipleImages = useMemo(() => availableImages.length > 1, [availableImages]);

    // ============================================================================
    // EFFECTS
    // ============================================================================

    // Sync external template prop
    useEffect(() => {
        if (template && template !== selectedStyle) {
            setSelectedStyle(template);
        }
    }, [template]);

    // Dynamic scaling
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const padding = isMobile ? 32 : 64;
                const availableWidth = containerWidth - padding;
                const newScale = Math.min(availableWidth / TEMPLATE_SIZE, 0.5);
                setScale(newScale);
            }
        };

        updateScale();

        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [isMobile]);

    // Preload images
    useEffect(() => {
        const preloadImages = async () => {
            setImagesLoaded(false);
            const images = property?.images || [];

            if (images.length === 0) {
                setImagesLoaded(true);
                return;
            }

            try {
                const imageUrls = images.slice(0, 3).map((img: any) =>
                    typeof img === 'string' ? img : img.image
                );

                await Promise.all(
                    imageUrls.map((url: string) =>
                        new Promise((resolve) => {
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.onload = resolve;
                            img.onerror = resolve;
                            img.src = url;
                        })
                    )
                );

                setImagesLoaded(true);
            } catch (err) {
                console.error('Image preload error:', err);
                setImagesLoaded(true);
            }
        };

        preloadImages();
    }, [property?.images, selectedStyle]);



    // Reset image index when images change
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [property?.images]);

    // ============================================================================
    // HANDLERS
    // ============================================================================

    const generateImage = useCallback(async (): Promise<Blob | null> => {
        if (!templateRef.current) {
            setError('Template not ready');
            return null;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const element = templateRef.current;

            // Store original styles
            const originalStyles = {
                transform: element.style.transform,
                transition: element.style.transition,
                animation: element.style.animation,
            };

            // Reset transforms for clean capture
            element.style.transform = 'none';
            element.style.transition = 'none';
            element.style.animation = 'none';

            // Wait for fonts and layout
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 600));

            const blob = await toBlob(element, {
                quality: 0.95,
                type: 'image/jpeg',
                pixelRatio: 2,
                backgroundColor: '#f5f5f5',
                cacheBust: true,
                fontEmbedCSS: '',
                skipFonts: true,
                style: {
                    transform: 'none',
                    transition: 'none',
                    animation: 'none'
                }
            } as any);

            // Restore original styles
            Object.assign(element.style, originalStyles);

            if (!blob) {
                setError('Failed to generate image');
                return null;
            }

            return blob;
        } catch (err) {
            console.error('Image generation error:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate image');
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const handleDownload = useCallback(async () => {
        const blob = await generateImage();
        if (!blob) return;

        try {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const filename = `saudapakka_${property.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'property'
                }_${selectedStyle}_${Date.now()}.jpg`;

            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            setError('Download failed. Please try again.');
        }
    }, [generateImage, property.title, selectedStyle]);

    const handleShare = useCallback(async () => {
        // Check if Web Share API is supported
        if (!navigator.share) {
            // No share API - download with helpful message
            await handleDownload();
            setError('Image downloaded! Now you can share it from your gallery.');
            setTimeout(() => setError(null), 5000); // Clear message after 5 seconds
            return;
        }

        const blob = await generateImage();
        if (!blob) return;

        try {
            const file = new File([blob], 'saudapakka-property.jpg', { type: 'image/jpeg' });

            // Check if file sharing is specifically supported
            if (navigator.canShare && !navigator.canShare({ files: [file] })) {
                console.warn('File sharing not supported on this device/browser');
                // Download instead and guide user
                await handleDownload();
                setError('Downloaded! Open the image from your gallery to share it.');
                setTimeout(() => setError(null), 5000);
                return;
            }

            // Main Share execution
            await navigator.share({
                files: [file],
                title: property.title || 'Property for Sale',
                text: `Check out this ${property.bedrooms || ''} property in ${property.city || 'Prime Location'}!`,
            });

            // Clear any previous errors on successful share
            setError(null);
        } catch (err: any) {
            // Ignore user aborts (closing the share sheet)
            if (err.name !== 'AbortError') {
                console.error('Share error:', err);
                // If native share fails (rare), fallback to download
                await handleDownload();
                setError('Downloaded! You can now share it from your gallery.');
                setTimeout(() => setError(null), 5000);
            }
        }
    }, [generateImage, handleDownload, property]);

    const handleStyleChange = useCallback((styleId: TemplateId) => {
        setSelectedStyle(styleId);
        setError(null);
    }, []);

    const handleErrorDismiss = useCallback(() => {
        setError(null);
    }, []);

    const handleNextImage = useCallback(() => {
        setCurrentImageIndex((prev) =>
            prev < availableImages.length - 1 ? prev + 1 : 0
        );
    }, [availableImages.length]);

    const handlePreviousImage = useCallback(() => {
        setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : availableImages.length - 1
        );
    }, [availableImages.length]);

    const handleImageSelect = useCallback((index: number) => {
        setCurrentImageIndex(index);
    }, []);



    const ImageSwitcher = () => {
        if (!hasMultipleImages) return null;

        return (
            <div style={isMobile ? styles.imageSwitcherMobile : styles.imageSwitcher}>
                {/* Navigation Buttons */}
                <div style={styles.imageNavButtons}>
                    <button
                        onClick={handlePreviousImage}
                        disabled={isGenerating}
                        aria-label="Previous image"
                        style={{
                            ...styles.imageNavButton,
                            ...(isGenerating ? styles.imageNavButtonDisabled : {})
                        }}
                    >
                        ‹
                    </button>

                    <span style={styles.imageCounter}>
                        {currentImageIndex + 1} / {availableImages.length}
                    </span>

                    <button
                        onClick={handleNextImage}
                        disabled={isGenerating}
                        aria-label="Next image"
                        style={{
                            ...styles.imageNavButton,
                            ...(isGenerating ? styles.imageNavButtonDisabled : {})
                        }}
                    >
                        ›
                    </button>
                </div>

                {/* Image Thumbnails */}
                {!isMobile && availableImages.length <= 6 && (
                    <div style={styles.imageThumbnails}>
                        {availableImages.map((img: any, index: number) => {
                            const imgSrc = typeof img === 'string' ? img : img.image;
                            const isActive = index === currentImageIndex;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleImageSelect(index)}
                                    disabled={isGenerating}
                                    aria-label={`Select image ${index + 1}`}
                                    style={{
                                        ...styles.thumbnailButton,
                                        ...(isActive ? styles.thumbnailButtonActive : {}),
                                        ...(isGenerating ? styles.thumbnailButtonDisabled : {})
                                    }}
                                >
                                    <img
                                        src={imgSrc}
                                        alt={`Preview ${index + 1}`}
                                        style={styles.thumbnailImage}
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div style={styles.container}>
            {/* ⭐ COMPACT TOOLBAR */}
            <div style={isMobile ? styles.toolbarMobile : styles.toolbar}>
                {/* Template Selector */}
                <div style={styles.templateSelectorWrapper}>
                    <div style={styles.templateSelector}>
                        {TEMPLATE_STYLES.map((style) => {
                            const isSelected = selectedStyle === style.id;
                            return (
                                <button
                                    key={style.id}
                                    onClick={() => handleStyleChange(style.id)}
                                    disabled={isGenerating}
                                    aria-label={`Select ${style.name} template`}
                                    aria-pressed={isSelected}
                                    style={{
                                        ...styles.templateButton,
                                        ...(isMobile ? styles.templateButtonMobile : {}),
                                        ...(isSelected ? styles.templateButtonActive : styles.templateButtonInactive),
                                        ...(isGenerating ? styles.templateButtonDisabled : {}),
                                    }}
                                >
                                    <span style={isMobile ? styles.iconMobile : styles.icon}>
                                        <style.icon size={isMobile ? 16 : 18} />
                                    </span>
                                    {(isSelected || !isMobile) && (
                                        <span>{style.name}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>



                {/* Error/Info Alert */}
                {error && (
                    <div
                        style={{
                            ...(isMobile ? styles.errorMobile : styles.error),
                            // Use info styling for download guidance messages
                            ...(error.toLowerCase().includes('download')
                                ? (isMobile ? styles.infoAlertMobile : styles.infoAlert)
                                : {})
                        }}
                        role={error.toLowerCase().includes('download') ? 'status' : 'alert'}
                    >
                        <AlertCircle size={16} style={styles.errorIcon} />
                        <span style={styles.errorText}>{error}</span>
                        <button
                            onClick={handleErrorDismiss}
                            aria-label="Dismiss message"
                            style={styles.errorDismiss}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Loading Indicator */}
                {!imagesLoaded && (
                    <div style={isMobile ? styles.loadingMobile : styles.loading} role="status">
                        <Loader2 size={16} style={styles.loadingIcon} aria-hidden="true" />
                        <span>Loading images...</span>
                    </div>
                )}
            </div>

            {/* ⭐ SCROLLABLE PREVIEW AREA */}
            <div style={styles.previewArea}>
                <div ref={containerRef} style={styles.previewContainer}>
                    {/* Template Label */}
                    <div style={styles.templateLabel}>
                        <span style={styles.templateLabelText}>
                            {currentTemplate?.icon && <currentTemplate.icon size={16} />} {currentTemplate?.name} Template
                        </span>
                    </div>

                    {/* Image Switcher */}
                    <ImageSwitcher />

                    {/* Preview Box */}
                    <div
                        style={{
                            ...styles.previewBox,
                            width: `${scale * TEMPLATE_SIZE}px`,
                            height: `${scale * TEMPLATE_SIZE}px`,
                        }}
                    >
                        <div
                            ref={templateRef}
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                width: `${TEMPLATE_SIZE}px`,
                                height: `${TEMPLATE_SIZE}px`,
                            }}
                        >
                            <RichTemplate
                                property={{
                                    ...property,
                                    images: availableImages.length > 0
                                        ? [availableImages[currentImageIndex]]
                                        : property.images,
                                }}
                                templateStyle={selectedStyle}
                                id="marketing-template"
                            />
                        </div>

                        {/* Generating Overlay */}
                        {isGenerating && (
                            <div style={styles.generatingOverlay} role="status" aria-live="polite">
                                <div style={isMobile ? styles.generatingBoxMobile : styles.generatingBox}>
                                    <Loader2
                                        size={isMobile ? 40 : 48}
                                        style={styles.generatingSpinner}
                                        aria-hidden="true"
                                    />
                                    <p style={styles.generatingText}>Generating...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Text */}
                    <div style={styles.infoText}>
                        Perfect for WhatsApp • Instagram • Facebook
                        <br />
                        Full HD: 1080×1080px
                    </div>
                </div>
            </div>

            {/* ⭐ STICKY BOTTOM ACTION BAR */}
            <div style={isMobile ? styles.actionBarMobile : styles.actionBar}>
                <div style={styles.actionButtons}>
                    <button
                        onClick={handleShare}
                        disabled={!canGenerate}
                        aria-label="Share marketing image"
                        style={{
                            ...styles.actionButton,
                            ...styles.shareButton,
                            ...(canGenerate ? styles.shareButtonActive : styles.actionButtonDisabled),
                        }}
                    >
                        {isGenerating ? (
                            <Loader2 size={20} style={styles.buttonSpinner} />
                        ) : (
                            <Share2 size={20} />
                        )}
                        <span>Share</span>
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={!canGenerate}
                        aria-label="Download marketing image"
                        style={{
                            ...styles.actionButton,
                            ...styles.downloadButton,
                            ...(canGenerate ? styles.downloadButtonActive : styles.actionButtonDisabled),
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} style={styles.buttonSpinner} />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                <span>Download</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        backgroundColor: '#F3F4F6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
    },

    // Toolbar
    toolbar: {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 20px',
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    toolbarMobile: {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '10px',
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },

    // Template Selector
    templateSelectorWrapper: {
        overflowX: 'auto' as const,
        WebkitOverflowScrolling: 'touch' as const,
        scrollbarWidth: 'none' as const,
        msOverflowStyle: 'none' as const,
    },
    templateSelector: {
        display: 'flex',
        gap: '6px',
        paddingBottom: '2px',
    },
    templateButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: 'fit-content',
        whiteSpace: 'nowrap' as const,
        padding: '8px 14px',
        gap: '6px',
    },
    templateButtonMobile: {
        padding: '8px 12px',
        fontSize: '11px',
    },
    templateButtonActive: {
        backgroundColor: '#111827',
        color: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    },
    templateButtonInactive: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
    },
    templateButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },

    icon: {
        fontSize: '18px',
    },
    iconMobile: {
        fontSize: '16px',
    },

    // Error
    error: {
        marginTop: '8px',
        padding: '10px 12px',
        backgroundColor: '#FEE2E2',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#991B1B',
    },
    errorMobile: {
        marginTop: '8px',
        padding: '8px 10px',
        backgroundColor: '#FEE2E2',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#991B1B',
    },
    errorIcon: {
        flexShrink: 0,
    },
    errorText: {
        flex: 1,
    },
    errorDismiss: {
        background: 'none',
        border: 'none',
        color: '#991B1B',
        cursor: 'pointer',
        fontSize: '20px',
        padding: '0 4px',
        lineHeight: 1,
    },

    // Info Alert (for download guidance messages)
    infoAlert: {
        marginTop: '8px',
        padding: '10px 12px',
        backgroundColor: '#EFF6FF',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#1E40AF',
    },
    infoAlertMobile: {
        marginTop: '8px',
        padding: '8px 10px',
        backgroundColor: '#EFF6FF',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#1E40AF',
    },

    // Loading
    loading: {
        marginTop: '8px',
        padding: '10px 12px',
        backgroundColor: '#EFF6FF',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#1E40AF',
    },
    loadingMobile: {
        marginTop: '8px',
        padding: '8px 10px',
        backgroundColor: '#EFF6FF',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#1E40AF',
    },
    loadingIcon: {
        flexShrink: 0,
        animation: 'spin 1s linear infinite',
    },

    // Preview Area
    previewArea: {
        flex: 1,
        overflow: 'auto' as const,
        WebkitOverflowScrolling: 'touch' as const,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    previewContainer: {
        position: 'relative' as const,
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '16px',
    },

    templateLabel: {
        textAlign: 'center' as const,
    },
    templateLabelText: {
        display: 'inline-block',
        padding: '6px 14px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#6B7280',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #E5E7EB',
    },

    previewBox: {
        position: 'relative' as const,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        borderRadius: '12px',
        overflow: 'hidden' as const,
        transition: 'width 0.2s, height 0.2s',
    },

    generatingOverlay: {
        position: 'absolute' as const,
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        zIndex: 10,
    },
    generatingBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center' as const,
        minWidth: '200px',
    },
    generatingBoxMobile: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center' as const,
        minWidth: '160px',
    },
    generatingSpinner: {
        animation: 'spin 1s linear infinite',
        margin: '0 auto 12px',
        color: '#111827',
        display: 'block',
    },
    generatingText: {
        fontSize: '16px',
        fontWeight: 600,
        color: '#111827',
        margin: 0,
    },

    infoText: {
        textAlign: 'center' as const,
        fontSize: '11px',
        color: '#9CA3AF',
        lineHeight: 1.6,
    },

    // Action Bar
    actionBar: {
        flexShrink: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '16px 20px',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
    },
    actionBarMobile: {
        flexShrink: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '12px',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
    },

    actionButtons: {
        display: 'flex',
        gap: '10px',
        maxWidth: '540px',
        margin: '0 auto',
    },

    actionButton: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 20px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '15px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },

    shareButton: {
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
    },
    shareButtonActive: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },

    downloadButton: {
        backgroundColor: '#111827',
        color: '#FFFFFF',
    },
    downloadButtonActive: {
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
    },

    actionButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: '#E5E7EB',
        color: '#9CA3AF',
        boxShadow: 'none',
    },

    buttonSpinner: {
        animation: 'spin 1s linear infinite',
    },



    // Image Switcher
    imageSwitcher: {
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB',
        width: '100%',
    },
    imageSwitcherMobile: {
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB',
        width: '100%',
    },
    imageNavButtons: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '12px',
    },
    imageNavButton: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        color: '#111827',
        fontSize: '24px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    imageNavButtonDisabled: {
        opacity: 0.4,
        cursor: 'not-allowed',
    },
    imageCounter: {
        fontSize: '15px',
        fontWeight: 700,
        color: '#111827',
        minWidth: '60px',
        textAlign: 'center' as const,
    },
    imageThumbnails: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid #E5E7EB',
    },
    thumbnailButton: {
        border: '3px solid #E5E7EB',
        borderRadius: '8px',
        padding: 0,
        cursor: 'pointer',
        overflow: 'hidden' as const,
        transition: 'all 0.2s',
        backgroundColor: '#F9FAFB',
        aspectRatio: '1',
    },
    thumbnailButtonActive: {
        borderColor: '#3B82F6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
    },
    thumbnailButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
        display: 'block',
    },
};
