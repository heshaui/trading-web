
import React from 'react';
import styles from './styles/invite.module.css';
import { useThemeMode } from '@/hooks/useThemeMode';
import useCopyToClipboard from '@/hooks/use-copy-to-clipboard';
import { Iconify } from "@/components/icon"
import InviteBanner from './components/invite_banner';
import InviteContent from './components/invite_content';
import InviteModal from './components/modal/invite_Modal';
import { useState } from 'react';
const InvitePage = () => {
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { copyFn } = useCopyToClipboard();
    const [open, setOpen] = useState(false);
    const onInviteReturn = () => {
        setOpen(true)
    }

    return (<>
        <div className={`${styles.invite_page} flex-y align-center`}>
            <div className={`${styles.main_page_box} font-16 fontw-400`}>
                <InviteBanner onReturn={onInviteReturn}/>
                <InviteContent onReturn={onInviteReturn}/>
                <InviteModal open={open} onCancel={()=>setOpen(false)} onOk={()=>setOpen(false)}/>
            </div>
        </div>
    </>
    );
};

export default InvitePage;