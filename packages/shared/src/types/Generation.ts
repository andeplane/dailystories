export interface GenerationCallbacks {
  onProgress: (progress: number, message: string) => void;
  onOutline?: (outline: string) => void;
  onPageUpdate?: (text: string, image: string | null) => void;
  onCoverGenerated?: (coverImage: string) => void;
}

export interface PageTiming {
  pageNum: number;
  duration: number;
}
