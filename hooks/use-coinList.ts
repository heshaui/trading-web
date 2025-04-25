import { useEffect, useState } from 'react';
import appStore from '@/store';

export const useCoinList = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadCoinList = async () => {
        try {
            setLoading(true);
            setError(null);
            await appStore.loadCoinList();
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoinList();
    }, []);

    return {
        coinList: appStore.getCoinList(),
        loading,
        error,
        reload: loadCoinList
    };
};