import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined';

// 安全地获取 localStorage 数据
const getLocalStorage = (key: string): string | null => {
    if (isBrowser) {
        return localStorage.getItem(key);
    }
    return null;
};

// 安全地设置 localStorage 数据
const setLocalStorage = (key: string, value: string): void => {
    if (isBrowser) {
        localStorage.setItem(key, value);
    }
};

class ForbiddenPathManager {
    private static instance: ForbiddenPathManager;
    private forbiddenPaths: string[] = [];

    private constructor() {
        this.loadForbiddenPaths();
    }

    public static getInstance(): ForbiddenPathManager {
        if (!ForbiddenPathManager.instance) {
            ForbiddenPathManager.instance = new ForbiddenPathManager();
        }
        return ForbiddenPathManager.instance;
    }

    // 加载保存的禁止路径
    private loadForbiddenPaths(): void {
        const savedPaths = getLocalStorage(LOCAL_STORAGE_KEY.PATH_FORBIDDEN);
        if (savedPaths) {
            this.forbiddenPaths = JSON.parse(savedPaths);
        }
    }

    // 保存禁止路径到 localStorage
    private saveForbiddenPaths(): void {
        setLocalStorage(LOCAL_STORAGE_KEY.PATH_FORBIDDEN, JSON.stringify(this.forbiddenPaths));
    }

    // 添加禁止路径
    public addForbiddenPath(path: string): void {
        if (!this.forbiddenPaths.includes(path)) {
            this.forbiddenPaths.push(path);
            this.saveForbiddenPaths();
        }
    }

    // 移除禁止路径
    public removeForbiddenPath(path: string): void {
        this.forbiddenPaths = this.forbiddenPaths.filter(p => p !== path);
        this.saveForbiddenPaths();
    }

    // 批量添加禁止路径
    public addForbiddenPaths(paths: string[]): void {
        paths.forEach(path => {
            if (!this.forbiddenPaths.includes(path)) {
                this.forbiddenPaths.push(path);
            }
        });
        this.saveForbiddenPaths();
    }

    // 批量移除禁止路径
    public removeForbiddenPaths(paths: string[]): void {
        this.forbiddenPaths = this.forbiddenPaths.filter(p => !paths.includes(p));
        this.saveForbiddenPaths();
    }

    // 获取所有禁止路径
    public getForbiddenPaths(): string[] {
        return [...this.forbiddenPaths];
    }

    // 清空所有禁止路径
    public clearForbiddenPaths(): void {
        this.forbiddenPaths = [];
        this.saveForbiddenPaths();
    }

    // 检查路径是否被禁止
    public isForbidden(path: string): boolean {
        // 精确匹配
        if (this.forbiddenPaths.includes(path)) {
            return true;
        }

        // 前缀匹配
        return this.forbiddenPaths.some(forbiddenPath => 
            path.startsWith(forbiddenPath)
        );
    }
}

// 导出单例实例
export const forbiddenPathManager = ForbiddenPathManager.getInstance();