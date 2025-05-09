// 获取公告详情
const fetchAnnouncementDetail = useCallback(async (noticeId) => {
    if (!noticeId) return Promise.resolve();
    
    try {
        setIsLoading(true); // 设置加载状态
        
        const lang = localStorage.getItem('lang') || 'zh_CN';
        console.log(`获取公告详情, ID: ${noticeId}`);
        
        const response = await getBulletinDetailLogined({
            languageCode: lang,
            id: parseInt(noticeId, 10)
        });

        if (response?.code === '0' && response.data) {
            const detailData = response.data;
            console.log('获取公告详情成功:', detailData);
            
            // 更新当前消息的内容
            const messageData = {
                id: detailData.id.toString(),
                title: detailData.title,
                time: detailData.createTimeStr,
                content: detailData.content,
                isRead: true,
            };
            
            setCurrentMessage(messageData);
            setCurrentMessageContent(detailData.content || '');
            setShowContent(true); // 显示详情内容
            
            // 从announcementData中尝试找到包含当前公告的菜单
            console.log('尝试从已缓存数据中找到包含当前公告的菜单');
            let foundInMenu = false;
            
            // 遍历announcementData中的所有菜单数据，尝试找到包含当前公告ID的菜单
            for (const [menuKey, messages] of Object.entries(announcementData)) {
                if (Array.isArray(messages)) {
                    const found = messages.some(msg => msg.id === detailData.id.toString());
                    if (found) {
                        // 找到包含当前公告的菜单
                        const matchedMenu = menuList.find(menu => menu.serialNum.toString() === menuKey || menu.id.toString() === menuKey);
                        if (matchedMenu) {
                            console.log(`在菜单 ${matchedMenu.languageContent} 中找到当前公告`);
                            setSelectedKeys([matchedMenu.serialNum.toString()]);
                            setSelectedLabel(matchedMenu.languageContent);
                            
                            // 获取该菜单的所有公告列表
                            const menuId = matchedMenu.id;
                            const menuKey = matchedMenu.serialNum.toString();
                            
                            // 使用并行方式加载公告列表，不阻塞当前详情显示
                            fetchAnnouncementByMenuId({
                                key: menuKey,
                                id: menuId
                            }).then(() => {
                                console.log(`已加载菜单 ${matchedMenu.languageContent} 的公告列表`);
                            });
                            
                            foundInMenu = true;
                            break;
                        }
                    }
                }
            }
            
            // 如果在缓存中找不到，则选择默认菜单并尝试获取公告列表
            if (!foundInMenu && menuList.length > 0) {
                const defaultMenu = menuList[0]; // 默认选择第一个菜单
                const defaultKey = defaultMenu.serialNum.toString();
                
                console.log(`默认选择菜单: ${defaultMenu.languageContent}`);
                setSelectedKeys([defaultKey]);
                setSelectedLabel(defaultMenu.languageContent);
                
                // 使用并行方式加载公告列表，不阻塞当前详情显示
                fetchAnnouncementByMenuId({
                    key: defaultKey,
                    id: defaultMenu.id
                }).then(() => {
                    console.log(`已加载菜单 ${defaultMenu.languageContent} 的公告列表`);
                });
            }
            
            // 标记为已读
            setReadMessageIds(prev => new Set([...prev, detailData.id.toString()]));
        } else {
            console.error('获取公告详情失败，API返回错误:', response);
        }
    } catch (error) {
        console.error('获取公告详情失败:', error);
    } finally {
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }
    return Promise.resolve();
}, [menuList, announcementData]);
