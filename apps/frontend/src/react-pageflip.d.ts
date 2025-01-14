// src/react-pageflip.d.ts
declare module "react-pageflip" {
  import * as React from "react";

  export interface HTMLFlipBookProps {
    width?: number;
    height?: number;
    size?: string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    className?: string;
    [key: string]: any;
  }

  export default class HTMLFlipBook extends React.Component<HTMLFlipBookProps> {}
}
