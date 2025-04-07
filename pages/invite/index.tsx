
import React from 'react';
import styles from './styles/invite.module.css';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Iconify } from "@/components/icon"
import InviteBanner from './components/invite_banner';
import InviteContent from './components/invite_content';
import InviteModal from './components/modal/invite_Modal';
import { useEffect, useState } from 'react';
import { getLoginInfo } from '@/services/overview';
import { useRouter } from 'next/router';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
interface InviteInfoType {
    inviteCode: string,
    inviteLink: string,
}
const InvitePage = () => {
    const router = useRouter();
    const { isDayMode } = useThemeMode(); // 使用 hook
    // const { copyFn } = useCopyToClipboard();
    const [open, setOpen] = useState(false);
    const [inviteInfo, setInviteInfo] = useState({} as InviteInfoType)
    const BASE_URL = process.env.NEXT_PUBLIC_INVITE_BASE;

    const onInviteReturn = () => {
        setOpen(true)

    }
    const inviteModalOK = () => {
        console.log(1111);

        router.push(`/register?inviteCode=${inviteInfo.inviteCode}`)
        // setOpen(false)
    }
    const getLoginInfoData = async () => {
        // const res = await getLoginInfo();
        // if (res.code === '0') {
        //     const param = {
        //         inviteCode: res.data.inviteCode||'',
        //         inviteLink: `${BASE_URL}/register?inviteCode=${res.data.inviteCode||''}`
        //     }
        //     setInviteInfo(param);
        // }
        if (typeof window !== 'undefined') {
            const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
            const param = {
                inviteCode: userInfo.inviteCode || '',
                inviteLink: `${BASE_URL}/register?inviteCode=${userInfo.inviteCode || ''}`
            }
            setInviteInfo(param)
        }
    }
    useEffect(() => {
        getLoginInfoData();
    }, [])
    return (<>
        <div className={`${styles.invite_page} flex-y align-center`}>
            <div className={`${styles.main_page_box} font-16 fontw-400`}>
                <InviteBanner onReturn={onInviteReturn} inviteInfo={inviteInfo} />
                <InviteContent onReturn={onInviteReturn} />
                <InviteModal open={open} onCancel={() => setOpen(false)} onOk={inviteModalOK} />
            </div>
        </div>
    </>
    );
};

export default InvitePage;