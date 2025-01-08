import React from 'react';
import styles from '@/styles/components/HomeMenu.module.css';
import { TabsItemProps } from '@/utils/types';

const TabsItem: React.FC<TabsItemProps> = ({
    src,
    h5Text,
    spanText,
    incNum,
    normalNum,
    colorSpan,
    needNumber = false,
}) => {
    return (
        <div className={styles.childrenItemBox}>
            <div className={styles.leftItem}>
                <img src={src} />
                <span>{h5Text}</span>
                {/* {
                    (colorSpan && colorSpan === 'blue') ? (<span className={styles.blueSpan}>{spanText}</span>) : (<span className={styles.orangeSpan}>{spanText}</span>)
                } */}
                {
                    colorSpan === 'blue' ? (
                        <span className={styles.blueSpan}>{spanText}</span>
                    ) : colorSpan === 'orange' ? (
                        <span className={styles.orangeSpan}>{spanText}</span>
                    ) : (
                        <span style={{marginLeft: '8px'}}>{spanText}</span> // 如果colorSpan不是上述任何一个值，则使用默认样式
                    )
                }

            </div>
            {
                needNumber ? (
                    <div className={styles.rightItem}>
                        <span>{incNum}</span>
                        <span>{normalNum}</span>
                    </div>
                ) : (
                    <></>
                )
            }

        </div>
    );
};

export default TabsItem;