declare module 'vue-cropper' {
  import { DefineComponent, App } from 'vue'

  export interface VueCropperProps {
    img: string;
    outputSize?: number;
    outputType?: string;
    info?: boolean;
    canScale?: boolean;
    autoCrop?: boolean;
    autoCropWidth?: number;
    autoCropHeight?: number;
    fixed?: boolean;
    fixedNumber?: [number, number];
    full?: boolean;
    fixedBox?: boolean;
    canMove?: boolean;
    canMoveBox?: boolean;
    original?: boolean;
    centerBox?: boolean;
    high?: boolean;
    infoTrue?: boolean;
    maxImgSize?: number;
    enlarge?: number;
    mode?: string;
  }

  export interface VueCropperMethods {
    startCrop(): void;
    stopCrop(): void;
    clearCrop(): void;
    changeScale(num: number): void;
    rotateLeft(): void;
    rotateRight(): void;
    cropMove(option: { x: number; y: number }): void;
    getCropData(callback: (data: string) => void): void;
    getCropBlob(callback: (blob: Blob) => void): void;
  }

  export const VueCropper: DefineComponent<VueCropperProps, {}, VueCropperMethods>

  export interface VueCropperGlobal {
    version: string;
    install: (app: App) => void;
    VueCropper: typeof VueCropper;
  }

  const globalCropper: VueCropperGlobal
  export default globalCropper
}

declare module '*/vue-cropper.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-cropper/lib/vue-cropper.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
