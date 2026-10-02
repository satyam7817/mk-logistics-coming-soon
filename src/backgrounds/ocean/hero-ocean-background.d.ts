export interface HeroOceanBackgroundProps {
    /** Called on any GPU failure so the caller can swap in the fallback. */
    onError: (error: unknown) => void;
    frameRate?: number;
    className?: string;
}
export declare function HeroOceanBackground({ onError, frameRate, className, }: HeroOceanBackgroundProps): import("react").JSX.Element;
