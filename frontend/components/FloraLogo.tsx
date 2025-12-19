import Image from "next/image"
import LogoAsset from "@/public/loginAssets/royalLogo.svg"

type PictureMode = 'small' | 'medium' | 'large';

interface PictureProps {
  mode: PictureMode; 
}

export function FloraLogo({ mode }: PictureProps) {
  
  const widthMap = {
    small: 100,
    medium: 200,
    large: 300,
  };

  const width = widthMap[mode];

  return (
    <Image 
      src={LogoAsset} 
      alt="Royal FloraHolland Logo" 
      priority
      width={width}
      height={width} 
      style={{ 
        width: `${width}px`, 
        height: 'auto' 
      }} 
    />
  )
}