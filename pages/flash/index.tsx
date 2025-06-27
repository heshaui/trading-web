import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled from 'styled-components';
import { Button, Input, Collapse, Modal, Spin, Image,Tooltip } from 'antd';
import { SwapOutlined, InfoCircleOutlined, CloseOutlined, ArrowRightOutlined, ExclamationCircleOutlined, CheckOutlined } from '@ant-design/icons';
import { getConfig, trade, getPrice,preTrade } from '@/services/flash';
import { getCoinAll } from '@/services/assets';
import { useRouter, NextRouter } from 'next/router';
import { getUserBalanceAll } from '@/services/assets';
import SpotBuyModal from '@/components/spotModal/placeOrder_modal';
import appStore from '@/store';
import { useCoinList } from '@/hooks/use-coinList';
import { getRate, getCoinRate, getCoinRound } from '@/utils/getUseRate';
import ImageSelect, { ImageSelectOption } from '@/components/ImageSelect';
import styles from './flash.module.css';
import { useThemeMode } from '@/hooks/useThemeMode';



const { Panel } = Collapse;

// Styled Components
const StyledButton = styled(Button)`
  &.ant-btn[disabled] {
    background-color: var(--border-color-disable);
    border-color: var(--border-color-disable);

    
  
  }
`;

const FlashPage: NextPage = () => {

  const { t } = useTranslation(['flash','spot','common']);
  const [payAmount, setPayAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [priceExpired, setPriceExpired] = useState<boolean>(false);
  const [preTradeData, setPreTradeData] = useState<any>({});
  
  // Success and failure modal states
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);
  const [isFailureModalVisible, setIsFailureModalVisible] = useState<boolean>(false);
  const [tradeResult, setTradeResult] = useState<any>(null);
  const [isClientReady, setIsClientReady] = useState<boolean>(false);

  // 币种列表数据

  const [baseCoin, setBaseCoin] = useState<string>('');
  const [quteCoin, setQuteCoin] = useState<string>('');
  const [userAll,setUserAll] = useState<any[]>([]); 
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [refreshCount, setRefreshCount] = useState<number>(0); // 重新请求次数计数器
  const [isAmountValid, setIsAmountValid] = useState<boolean>(true); // 金额是否在限额范围内
  const [flashDisable, setFlashDisable] = useState<boolean>(true); // 闪兑功能是否禁用
  const {coinList} = useCoinList();

  const [isManualReceiveInput, setIsManualReceiveInput] = useState<boolean>(false);

  // 从 store 获取闪兑配置数据
  const configData = appStore.getFlashConfig();
  const { isDayMode } = useThemeMode();


  const flashConfigData = appStore.getKvConfig('flash_img');
  const langKey = appStore.getLang() || 'en_US';

  const headerBgImage = flashConfigData&&flashConfigData?.[langKey]?.img;

  const headerTitle = flashConfigData && flashConfigData[langKey] 
                        ? flashConfigData[langKey].title 
                        : '';
  const headerSubtitle = flashConfigData && flashConfigData[langKey] 
                        ? flashConfigData[langKey].subTitle 
                        : '';
  



  const router = useRouter();
  const [spotModal, setSpotModal] = useState<boolean>(false);

  // 验证金额是否在限额范围内
  const validateAmount = (amount: string, coinName: string) => {
    if (!amount || !configData?.minTradeU || !configData?.maxTradeU || !coinName) {
      return true; // 如果没有输入金额或配置数据，不显示错误
    }
    
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return true; // 如果不是数字，不显示限额错误
    }
    
    const minTradeU = getCoinRate(coinName, configData.minTradeU, 'USDT', 1).coinRate;
    const maxTradeU = getCoinRate(coinName, configData.maxTradeU, 'USDT', 1).coinRate;
    return Number(numAmount) >= Number(minTradeU) && Number(numAmount) <= Number(maxTradeU);
  };


  const getUserAllBala=async()=>{
   const res=await getUserBalanceAll()
    if(res.code==='0'){
      setUserAll(res.data)
    }
  }

  const gerFlashConfig = async (hasUrlParam: boolean = false) => {
    try {
      const config = await appStore.loadFlashConfig();
      const flashConvertSwitch = config.flashConvertSwitch
      
      // 设置闪兑功能开关状态
      setFlashDisable(flashConvertSwitch);
      
      // 获取可用的币种列表（过滤掉 isTradeConvert 为 0 的币种）
      const availableCoins = coinList.filter(item => item.isTradeConvert !== 0);
      
      // 如果URL中有参数，则不设置baseCoin，只设置quoteCoin
      if (!hasUrlParam) {
        // 检查配置中的 baseCoin 是否在可用列表中，如果不在则使用第一个
        const validBaseCoin = availableCoins.find(coin => coin.coinName === config.baseCoin) 
          ? config.baseCoin 
          : (availableCoins[0]?.coinName || '');
        setBaseCoin(validBaseCoin);
      }
      
      // 检查配置中的 quoteCoin 是否在可用列表中，如果不在则使用第一个（但要避免与 baseCoin 相同）
      let validQuoteCoin = availableCoins.find(coin => coin.coinName === config.quoteCoin) 
        ? config.quoteCoin 
        : (availableCoins[1]?.coinName || availableCoins[0]?.coinName || '');
      
      // 确保 quoteCoin 与 baseCoin 不同
      if (validQuoteCoin === baseCoin && availableCoins.length > 1) {
        validQuoteCoin = availableCoins.find(coin => coin.coinName !== baseCoin)?.coinName || '';
      }
      
      if(configData?.realNameRequired===false&&configData?.flashConvertSwitch===true){
        setIsAuth(true)
      }
      setQuteCoin(validQuoteCoin);
    } catch (error) {
    }
  }

  const getPreTrade = async () => {
    if(!baseCoin||!quteCoin){ return }
    const data = {
      send: baseCoin,
      receive: quteCoin
    }
    const res = await preTrade(data)
    if (res.code === '0') {
      setPreTradeData(res.data)
      // 获取新数据后，如果还在弹窗中且不是达到最大重试次数，则隐藏过期提示
      if (isConfirmModalVisible && refreshCount < 5) {
        setPriceExpired(false);
      }
    }
  }

  const getFlashPrice = async () => {
    if(!baseCoin||!quteCoin){ return }
    const data = {
      send: baseCoin,
      receive: quteCoin
    }
    try {
      const res = await getPrice(data)
      if (res.code === '0') {
        setExchangeRate(res.data)
        if (payAmount && !isNaN(Number(payAmount)) && !isNaN(Number(res.data))) {
          const calculatedAmount = (Number(payAmount) * Number(res.data)).toFixed(8);
          setReceiveAmount(calculatedAmount);
        }
      }else{
        setExchangeRate('')
      }
    } catch (error) {
      console.error('Failed to get flash price:', error)
    }
  }

  const handleConfirm = async () => {
    await getPreTrade()
    setIsConfirmModalVisible(true)
    setRefreshCount(0) // 重置重新请求次数
    setPriceExpired(false) // 重置价格过期状态
  }


  const handleTrade = async () => {
    const data = {
      sendCoin: baseCoin,
      receiveCoin: quteCoin,
      sendAmount: payAmount,
    }
    try {
      const res = await trade(data)
      setIsLoading(false)
      setIsConfirmModalVisible(false)
      
      if (res.code === '0') {
        setTradeResult({
          sendAmount: payAmount,
          sendCoin: baseCoin,
          receiveAmount: res.data.receiveAmount || receiveAmount,
          receiveCoin: res.data.receiveCoin || quteCoin,
          exchangeRate: exchangeRate
        })
        setIsSuccessModalVisible(true)
      } else {
        // Show failure modal
        setIsFailureModalVisible(true)
      }
    } catch (error) {
      console.error('Trade failed:', error)
      setIsLoading(false)
      setIsConfirmModalVisible(false)
      setIsFailureModalVisible(true)
    }
  }
  
  // Function to swap the selected coins
  const swapCoins = () => {
    // Store current values
    const tempBaseCoin = baseCoin
    const tempQuteCoin = quteCoin
    const tempPayAmount = payAmount
    const tempReceiveAmount = receiveAmount
    
    // Swap the values
    setBaseCoin(tempQuteCoin)
    setQuteCoin(tempBaseCoin)
    setPayAmount(tempReceiveAmount || '')
    setReceiveAmount(tempPayAmount)
    
    // 验证交换后的支付金额是否在限额范围内
    setIsAmountValid(validateAmount(tempReceiveAmount || '', tempQuteCoin));
    
    // Update the exchange rate after swapping - will be triggered by useEffect when coins change
  }


  useEffect(() => {
    getUserAllBala()
    const userInfo = localStorage.getItem('imbit_userInfo');
    if (userInfo) {
      if(configData?.realNameRequired){
      const parsedInfo = JSON.parse(userInfo);
      // setIsAuth(parsedInfo.realnessStatus === 1);
      if(parsedInfo.realnessStatus === 1){
        setIsAuth(true)
      }
      
    }
  }
  }, [])

  // 当 coinList 加载完成后执行配置获取和URL参数处理
  useEffect(() => {
    if (coinList && coinList.length > 0 && router.isReady) {
      // 检查URL中是否有参数
      const urlParams = new URLSearchParams(router.asPath.split('?')[1]);
      const coinName = Array.from(urlParams.keys())[0]; // 获取第一个参数名作为币种名
      
      let hasUrlParam = false;
      
      if (coinName && typeof coinName === 'string') {
        // 检查币种是否在可用列表中
        const availableCoins = coinList.filter(item => item.isTradeConvert !== 0);
        const targetCoin = availableCoins.find(coin => coin.coinName === coinName);
        
        if (targetCoin) {
          setBaseCoin(coinName);
          hasUrlParam = true;
        }
      }
      
      // 执行配置获取，传入是否有URL参数的标记
      gerFlashConfig(hasUrlParam);
    }
  }, [coinList, router.isReady, router.asPath])

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const goPage = (page: number) => {
    if (!router.isReady) {
      console.warn("FlashPage router not ready for goPage navigation.");
      return;
    }
    if(page === 1){
      router.push('/exchange')
    }else if(page === 2){
      router.push('/flashOrder')
    }
  }

  useEffect(() => {
    getFlashPrice()
  }, [baseCoin, quteCoin])

  // Calculate receive amount when pay amount or exchange rate changes
  useEffect(() => {
    if (payAmount && exchangeRate && !isNaN(Number(payAmount)) && !isNaN(Number(exchangeRate)) && !isManualReceiveInput) {
      const calculatedAmount = (Number(payAmount) * Number(exchangeRate));
      // 只有当计算结果需要显示多位小数时才使用 toFixed，否则保持原始精度
      const formattedAmount = calculatedAmount % 1 === 0 ? calculatedAmount.toString() : calculatedAmount.toFixed(8).replace(/\.?0+$/, '');
      setReceiveAmount(formattedAmount);
      
      // 当汇率变化时，重新验证支付金额是否在限额范围内
      setIsAmountValid(validateAmount(payAmount, baseCoin));
    }
  }, [payAmount, exchangeRate, isManualReceiveInput])

  // Countdown timer effect based on expireTime
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (preTradeData?.expireTime && isConfirmModalVisible) {
      const calculateRemainingTime = () => {
        const now = Date.now();
        const expireTime = preTradeData.expireTime;
        const remaining = Math.max(0, Math.ceil((expireTime - now) / 1000));
        setCountdown(remaining);
        
        if (remaining <= 0) {
          // 倒计时结束时自动重新请求接口，最多5次
          if (refreshCount < 5) {
            // 还有重试次数，先显示过期提示，然后重新请求
            setPriceExpired(true);
            setTimeout(() => {
              setPriceExpired(false);
              getPreTrade();
              setRefreshCount(prev => prev + 1);
            }, 1000); // 1秒后开始重新请求
          } else {
            // 达到最大重试次数，显示过期提示
            setPriceExpired(true);
          }
        }
        
        return remaining;
      };
      
      // 立即计算一次
      const remaining = calculateRemainingTime();
      
      if (remaining > 0) {
        timer = setInterval(() => {
          const newRemaining = calculateRemainingTime();
          if (newRemaining <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      }
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [preTradeData?.expireTime, isConfirmModalVisible])

  return (
    <>
      <Head>
        <title>{t('title')} | {t('common:title')}</title>
      </Head>
      <PageContainer>
        <Header bgImage={headerBgImage}>
          <h1>{headerTitle}</h1>
          <HeaderSubtitle>{headerSubtitle}</HeaderSubtitle>
        </Header>
        { configData?.realNameRequired&&!isAuth&&<AuthNoticeWrapper>
          <Image src='/images/flash/identy.png' width={80} height={74} alt="" preview={false} />
          <NoticeContent>
            <NoticeTitle>{t('authNotice.title')}</NoticeTitle>
            <NoticeDescription>{t('authNotice.description')}</NoticeDescription>
          </NoticeContent>
          <Button type="primary" shape="round" onClick={()=>router.push('/userCenter/identity')}>{t('authNotice.button')}</Button>
        </AuthNoticeWrapper>}
        <div style={{display:'flex',justifyContent:'flex-end',width:'700px',cursor:'pointer',marginTop:'26px' }}>
          <div style={{display:'flex',alignItems:'center'}}>
          <Image src={isDayMode ? '/images/flash/dayFrame.png' : '/images/flash/dayFrame_dark.png'} width={20} height={20} alt="" preview={false} /> <p style={{marginLeft:'5px',marginRight:'12px'}} onClick={() => goPage(1)}>{t('spotTrading')}</p>
          </div>
          <div style={{display:'flex',alignItems:'center'}}>
          <Image src={isDayMode ? '/images/flash/dayOrder.png' : '/images/flash/dayOrder_dark.png'} width={20} height={20} alt="" preview={false} /><p style={{marginLeft:'5px'}} onClick={() => goPage(2)}>{t('orderHistory')}</p>
          </div>
             
            </div>
        <ContentWrapper>
          <TradeContainer>
            <TradeSection>
              <TradeLabel>{t('pay')}</TradeLabel>
              <TradeInputWrapper>
                <StyledInput
                   placeholder={configData?.minTradeU && configData?.maxTradeU && baseCoin ? 
                     `${getCoinRound(baseCoin,getCoinRate(baseCoin, configData.minTradeU, 'USDT', 1).coinRate)}-${getCoinRound(baseCoin,getCoinRate(baseCoin, configData.maxTradeU, 'USDT', 1).coinRate)}` : 
                     ''}
                  value={payAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 只允许输入数字和小数点，不允许以小数点开头，不允许多个小数点
                    const regex = /^([0-9]+\.?[0-9]*|0\.[0-9]*)$/;
                    if (value === '' || regex.test(value)) {
                      setPayAmount(value);
                      // 验证金额限额
                      setIsAmountValid(validateAmount(value, baseCoin));
                      if (value && exchangeRate && !isNaN(Number(value)) && !isNaN(Number(exchangeRate))) {
                        const calculatedAmount = (Number(value) * Number(exchangeRate));
                        // 保持合理的精度显示
                        const formattedAmount = calculatedAmount % 1 === 0 ? calculatedAmount.toString() : calculatedAmount.toFixed(8).replace(/\.?0+$/, '');
                        setReceiveAmount(formattedAmount);
                      } else if (value === '') {
                        // 当支付金额被清空时，也清空接收金额
                        setReceiveAmount('');
                      }
                    }
                  }}
                />
                <MaxLabel 
                  style={{ borderRight: '1px solid #DCDCDC', paddingRight: '4px', cursor: 'pointer' }}
                  onClick={() => {
                    const currentCoin = userAll.find(item => item.coinName === baseCoin);
                    if (currentCoin && currentCoin.balance) {
                      setPayAmount(currentCoin.balance);
                      // 验证最大金额是否在限额范围内
                      setIsAmountValid(validateAmount(currentCoin.balance, baseCoin));
                      if (exchangeRate && !isNaN(Number(exchangeRate)) && !isNaN(Number(currentCoin.balance))) {
                        const calculatedAmount = (Number(currentCoin.balance) * Number(exchangeRate));
                        // 保持合理的精度显示
                        const formattedAmount = calculatedAmount % 1 === 0 ? calculatedAmount.toString() : calculatedAmount.toFixed(8).replace(/\.?0+$/, '');
                        setReceiveAmount(formattedAmount);
                      }
                    }
                  }}
                >{t('max')}</MaxLabel>
                <ImageSelect
                  value={baseCoin}
                  onChange={(value) => {
                    setBaseCoin(value)
                    setPayAmount('')
                    setReceiveAmount('')
                    // 如果选择的baseCoin与quteCoin相同，自动切换quteCoin到其他币种
                    if (value === quteCoin) {
                      const availableCoins = coinList.filter(item => item.isTradeConvert !== 0 && item.coinName !== value);
                      if (availableCoins.length > 0) {
                        setQuteCoin(availableCoins[0].coinName);
                      }
                    }
                  }}
                  showSearch={true}
                  showHistory={false}
                  maxHistory={0}
                  showBalance={true}
                  showPrice={false}
                  className={styles.compactImageSelect}
                  options={coinList.filter(item => item.isTradeConvert !== 0 && item.coinName !== quteCoin).map(item=>{
                    const userBalance = userAll.find(user => user.coinName === item.coinName);
                    return {
                      label: item.coinName,
                      value: item.coinName,
                      coinName: item.coinName,
                      iconUrl: item.iconUrl,
                      nameDefault: item.nameDefault,
                      balance: userBalance?.balance || '0'
                    };
                  })}
                />
                  



              </TradeInputWrapper>
             
            </TradeSection>
             {/* 现货可用余额 - 只在没有错误提示时显示 */}
             {!(payAmount && baseCoin && userAll.find(item=>item.coinName===baseCoin) && 
              Number(payAmount) > Number(userAll.find(item=>item.coinName===baseCoin)?.balance || 0)) &&
              !(payAmount && !isAmountValid && configData?.minTradeU && configData?.maxTradeU) && (
               <AvailableAmount>{t('available')} {getCoinRound(baseCoin,userAll.find(item=>item.coinName===baseCoin)?.balance) } {baseCoin} <Image src='/images/flash/add.png' style={{marginTop:'3px',cursor:'pointer'}} width={16} height={16} alt="" preview={false} onClick={()=>{setSpotModal(true)}} /></AvailableAmount>
             )}
             
             {/* 余额不足提示 */}
             {payAmount && baseCoin && userAll.find(item=>item.coinName===baseCoin) && 
              Number(payAmount) > Number(userAll.find(item=>item.coinName===baseCoin)?.balance || 0) && (
                <InsufficientBalanceAlert>
                  {t('insufficientBalance')}
                </InsufficientBalanceAlert>
              )}
              
             {/* 限额错误提示 */}
             {payAmount && !isAmountValid && configData?.minTradeU && configData?.maxTradeU && (
                <AmountLimitAlert>
                  {t('amountLimit')}：{getCoinRound(baseCoin,getCoinRate(baseCoin, configData.minTradeU, 'USDT', 1).coinRate)} {baseCoin} - {getCoinRound(baseCoin,getCoinRate(baseCoin, configData.maxTradeU, 'USDT', 1).coinRate)} {baseCoin}
                </AmountLimitAlert>
              )}

            <SwapButtonWrapper>
              <Image src='/images/flash/icon_Trading.svg' width={50} height={50} alt="" preview={false} onClick={swapCoins}  style={{cursor:'pointer'}} />
            </SwapButtonWrapper>

            <TradeSection>
              <TradeLabel>{t('receive')}</TradeLabel>
              <TradeInputWrapper>
                <StyledInput
                  placeholder={configData?.minTradeU && configData?.maxTradeU && quteCoin ? 
                    `${getCoinRound(quteCoin,getCoinRate(quteCoin, configData.minTradeU, 'USDT', 1).coinRate)}-${getCoinRound(quteCoin,getCoinRate(quteCoin, configData.maxTradeU, 'USDT', 1).coinRate)}` : 
                    ''}
                  value={receiveAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 只允许输入数字和小数点，不允许以小数点开头，不允许多个小数点
                    const regex = /^([0-9]+\.?[0-9]*|0\.[0-9]*)$/;
                    if (value === '' || regex.test(value)) {
                      setIsManualReceiveInput(true);
                      setReceiveAmount(value);
                      // Calculate pay amount when receive amount changes
                      if (value && exchangeRate && !isNaN(Number(value)) && !isNaN(Number(exchangeRate)) && Number(exchangeRate) > 0) {
                        const calculatedPayAmount = (Number(value) / Number(exchangeRate))
                        setPayAmount(calculatedPayAmount.toString());
                        
                        // 验证计算出的支付金额是否在限额范围内
                        setIsAmountValid(validateAmount(calculatedPayAmount.toString(), baseCoin));
                      } else if (value === '') {
                        // 当接收金额被清空时，也清空支付金额
                        setPayAmount('');
                      }
                      // 延迟重置标志，避免立即被 useEffect 覆盖
                      setTimeout(() => setIsManualReceiveInput(false), 100);
                    }
                  }}
                />
                {/* <MaxLabel 
                  style={{ borderRight: '1px solid #DCDCDC', paddingRight: '4px', cursor: 'pointer' }}
                  onClick={() => {
                    const currentCoin = userAll.find(item => item.coinName === quteCoin);
                    if (currentCoin && currentCoin.balance) {
                      setReceiveAmount(currentCoin.balance);
                      // Also calculate the pay amount based on the max receive amount
                      if (exchangeRate && !isNaN(Number(exchangeRate)) && !isNaN(Number(currentCoin.balance)) && Number(exchangeRate) > 0) {
                        const calculatedPayAmount = (Number(currentCoin.balance) / Number(exchangeRate)).toFixed(8);
                        setPayAmount(calculatedPayAmount);
                        
                        // 验证计算出的支付金额是否在限额范围内
                        setIsAmountValid(validateAmount(calculatedPayAmount, baseCoin));
                      }
                    }
                  }}
                >{t('max')}</MaxLabel> */}
                <ImageSelect
                  value={quteCoin}
                  onChange={(value) => {
                    setQuteCoin(value)
                    setPayAmount('')
                    setReceiveAmount('')
                    // 如果选择的quteCoin与baseCoin相同，自动切换baseCoin到其他币种
                    if (value === baseCoin) {
                      const availableCoins = coinList.filter(item => item.isTradeConvert !== 0 && item.coinName !== value);
                      if (availableCoins.length > 0) {
                        setBaseCoin(availableCoins[0].coinName);
                      }
                    }
                  }}
                  showSearch={true}
                  showHistory={false}
                  maxHistory={0}
                  showBalance={true}
                  showPrice={false}
                  className={styles.compactImageSelect}
                  options={coinList.filter(item => item.isTradeConvert !== 0 && item.coinName !== baseCoin).map(item=>{
                    const userBalance = userAll.find(user => user.coinName === item.coinName);
                    return {
                      label: item.coinName,
                      value: item.coinName,
                      coinName: item.coinName,
                      nameDefault: item.nameDefault,
                      iconUrl: item.iconUrl,
                      balance: userBalance?.balance || '0'
                    };
                  })}
                />
              </TradeInputWrapper>

            </TradeSection>
                          <MarketPrice>
                            <Tooltip title={t('exchangeRateTooltip')}>
                <span style={{ textDecoration: 'underline', textDecorationStyle: 'dashed',cursor:'pointer'}}>
                {t('exchangeRate')}:  </span>{!exchangeRate || !payAmount? '--': `1${baseCoin} ≈ ${exchangeRate} ${quteCoin}`}
                </Tooltip>
              </MarketPrice>
            <StyledButton onClick={() => handleConfirm()} type='primary' style={{width:'100%',height:'50px'}} shape="round" disabled={!flashDisable || !isAuth || !payAmount || !receiveAmount || Number(payAmount) <= 0 || Number(receiveAmount) <= 0 || !isAmountValid}>{t('preview')}</StyledButton>

            {/* Confirmation Modal */}
            <ConfirmExchangeModal
              visible={isConfirmModalVisible}
              onClose={() => {
                setIsConfirmModalVisible(false)
                setCountdown(0) // 关闭时重置倒计时
                setPriceExpired(false) // 重置价格过期状态
                setRefreshCount(0) // 重置重新请求次数
              }}
              payAmount={payAmount}
              payCurrency={baseCoin}
              receiveAmount={receiveAmount}
              receiveCurrency={quteCoin}
              exchangeRate={exchangeRate}
              isLoading={isLoading}
              priceExpired={priceExpired}
              coinList={coinList}
              countdown={countdown}
              refreshCount={refreshCount}
              preTradeData={preTradeData}
              setPreTradeData={setPreTradeData}
              onConfirm={() => {
                setIsLoading(true)
                // Simulate API call
                handleTrade()
              }}
              onRefreshPrice={async () => {
                await getPreTrade();
                // 如果已经达到5次，则重置计数器，否则增加计数
                if (refreshCount >= 5) {
                  setRefreshCount(0);
                } else {
                  setRefreshCount(prev => prev + 1);
                }
                // 手动刷新时暂时隐藏过期提示，但会在新的倒计时结束后重新显示
                setPriceExpired(false);
              }}
            />
            
            {/* Success Modal */}
            {isClientReady && (
              <SuccessModal
              visible={isSuccessModalVisible}
              onClose={() => setIsSuccessModalVisible(false)}
              tradeResult={tradeResult}
              isDayMode={isDayMode}
              router={router} // Pass router instance
            />
            )}
            
            {/* Failure Modal */}
            <FailureModal
              visible={isFailureModalVisible}
              onClose={() => setIsFailureModalVisible(false)}
              isDayMode={isDayMode}
            />
          </TradeContainer>



        </ContentWrapper>
        <FAQSection>
            <FAQTitle>{t('faq.title')}</FAQTitle>
            <StyledCollapse expandIconPosition="end" >
              {/* Using default expand icon */}
              <Panel
                header={t('faq.q1.question')}
                key="1"
              >
                <p>{t('faq.q1.answer')}</p>
              </Panel>
              <Panel
                header={t('faq.q2.question')}
                key="2"
              >
                <p>{t('faq.q2.answer')}</p>
              </Panel>
              <Panel
                header={t('faq.q3.question')}
                key="3"
              >
                <p>{t('faq.q3.answer')}</p>
              </Panel>
              <Panel
                header={t('faq.q4.question')}
                key="4"
              >
                <p>{t('faq.q4.answer')}</p>
              </Panel>
              <Panel
                header={t('faq.q5.question')}
                key="5"
              >
                <p>{t('faq.q5.answer')}</p>
              </Panel>
            </StyledCollapse>
          </FAQSection>
      </PageContainer>
      <SpotBuyModal open={spotModal} onCancel={() => { setSpotModal(false) }} onOk={() => { setSpotModal(false) }} />

    </>
  );
};

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div<{
  bgImage?: string;
}>`
  width: 100%;
  color: white;
  padding: 20px 0;
  text-align: center;
  background-image: ${props => props.bgImage ? `url(${props.bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const HeaderSubtitle = styled.div`
  color: #999;
  margin-top: 5px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 530px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AuthNoticeWrapper = styled.div`
  width:1200px;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin: 24px 0 40px 0;


`;



const NoticeContent = styled.div`
  flex: 1;
  margin-left:15px;
`;

const NoticeTitle = styled.div`
  font-weight: bold;
  font-size: 18px;
`;

const NoticeDescription = styled.div`
  color: #666;
  font-size: 14px;
`;



const TradeContainer = styled.div`
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 20px;
  overflow: visible;
  position: relative;
`;

const TradeSection = styled.div`
  border: 1px solid var(--border-color6);
  border-radius: 8px;
  padding: 15px;
  overflow: visible;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--text-color3);
  }
`;

const TradeLabel = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
`;

const TradeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 5px 10px 5px 0px;
  overflow: visible;
  position: relative;
`;

const StyledInput = styled(Input)`
  border: none;
  flex: 1;
  transition: all 0.3s ease;
  

`;

const MaxLabel = styled.span`
  color: var(--text-color3);
  margin-right: 10px;
  cursor: pointer;
`;

// Removed CurrencySelector and CurrencyIcon styles as they're replaced by Ant Design Select

const AvailableAmount = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 5px;
 
`;

const InsufficientBalanceAlert = styled.div`
  font-size: 12px;
  color: #F73711;
  margin-top: 5px;
  margin-bottom: 5px;
  text-align: left;
`;

const AmountLimitAlert = styled.div`
  font-size: 12px;
  color: #F73711;
  margin-top: 5px;
  margin-bottom: 5px;
  text-align: left;
  border-radius: 4px;
`;

const MarketPrice = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 40px;
  margin-bottom: 18px;
  text-align: center;
`;

const SwapButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: -10px 0;
  position: relative;
  z-index: 1;
  margin: 30px 0;
  color: var(--text-color3);
`;

const SwapButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color:  var(--text-color3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;





const FAQSection = styled.div`
  width:920px;
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 20px;
`;

const FAQTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 18px;
`;

const StyledCollapse = styled(Collapse)`
  background-color: var(--background-color);
  border: none;
  
  .ant-collapse-item {
    border-bottom: 1px solid var(--border-color4);
  }
  
  .ant-collapse-header {
    padding: 12px 0;
    font-size: 14px;
  }
  
  .ant-collapse-content {
    border-top: none;
  }
`;

const FooterText = styled.div`
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 20px;
`;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common','spot','flash'])),
    },
  };
}

// Confirmation Modal Component
interface ConfirmExchangeModalProps {
  visible: boolean;
  onClose: () => void;
  payAmount: string;
  payCurrency: string;
  receiveAmount?: string;  // Make it optional
  receiveCurrency: string;
  exchangeRate: string;
  isLoading: boolean;
  priceExpired: boolean;
  onConfirm: () => void;
  onRefreshPrice: () => void;
  coinList: any[];
  countdown: number;
  refreshCount: number;
  preTradeData: any;
  setPreTradeData: (data: any) => void;
}

const ConfirmExchangeModal: React.FC<ConfirmExchangeModalProps> = ({
  visible,
  onClose,
  payAmount,
  payCurrency,
  receiveAmount,
  receiveCurrency,
  exchangeRate,
  isLoading,
  priceExpired,
  onConfirm,
  onRefreshPrice,
  coinList,
  countdown,
  refreshCount,
  preTradeData,
  setPreTradeData
}) => {
  const { t } = useTranslation(['flash','common']);
  
  // State to track if exchange rate display is flipped
  const [isRateFlipped, setIsRateFlipped] = useState<boolean>(false);

  // Find the coin icons for the selected currencies
  const findCoinIcon = (coinName: string) => {
    const coin = coinList.find((coin: any) => coin.coinName === coinName)
    return coin ? coin.iconUrl : ''
  }
  
  const payIcon = findCoinIcon(payCurrency)
  const receiveIcon = findCoinIcon(receiveCurrency)

  // Get display currency info based on API data
  const getDisplayCurrencyInfo = () => {
    if (preTradeData?.send && preTradeData?.receive && preTradeData?.price) {
      // 根据接口返回的数据确定显示的币种
      const displaySendCoin = preTradeData.send;
      const displayReceiveCoin = preTradeData.receive;
      
      // 计算对应的金额
      let displaySendAmount = payAmount;
      let displayReceiveAmount = receiveAmount;
      
      // 如果接口返回的币种与原始币种不同，说明发生了切换
      if (displaySendCoin !== payCurrency) {
        // 币种切换了，需要重新计算金额
        // 这时原来的 payAmount 应该作为接收金额，我们需要根据新汇率计算发送金额
        displayReceiveAmount = payAmount;
        if (preTradeData.price && !isNaN(Number(preTradeData.price)) && Number(preTradeData.price) > 0) {
          displaySendAmount = (Number(payAmount) / Number(preTradeData.price)).toFixed(8);
        } else {
          displaySendAmount = receiveAmount || '';
        }
      } else {
        // 币种没有切换，根据新汇率重新计算接收金额
        if (preTradeData.price && !isNaN(Number(preTradeData.price)) && !isNaN(Number(payAmount))) {
          displayReceiveAmount = (Number(payAmount) * Number(preTradeData.price)).toFixed(8);
        }
      }
      
      return {
        sendCoin: displaySendCoin,
        sendAmount: displaySendAmount,
        sendIcon: findCoinIcon(displaySendCoin),
        receiveCoin: displayReceiveCoin,
        receiveAmount: displayReceiveAmount,
        receiveIcon: findCoinIcon(displayReceiveCoin)
      };
    }
    
    // 默认显示原始数据
    return {
      sendCoin: payCurrency,
      sendAmount: payAmount,
      sendIcon: payIcon,
      receiveCoin: receiveCurrency,
      receiveAmount: receiveAmount,
      receiveIcon: receiveIcon
    };
  };

  const displayInfo = getDisplayCurrencyInfo();

  // Function to toggle exchange rate display and request new rate
  const toggleExchangeRate = async () => {
    // 根据当前的切换状态决定请求的币种对
    const data = {
      send: isRateFlipped ? payCurrency : receiveCurrency,
      receive: isRateFlipped ? receiveCurrency : payCurrency
    }
    
    try {
      const res = await preTrade(data)
      if (res.code === '0') {
        setPreTradeData(res.data)
        setIsRateFlipped(!isRateFlipped) // 切换显示状态
      }
    } catch (error) {
      console.error('Failed to get reversed exchange rate:', error)
    }
  }

  // Calculate the display values for exchange rate based on flip state
  const getExchangeRateDisplay = () => {
    if (!preTradeData?.price) return { leftValue: '1', leftCoin: payCurrency, rightValue: '--', rightCoin: receiveCurrency };
    
    // 根据切换状态显示汇率
    if (isRateFlipped) {
      // 切换后：显示 1 receiveCurrency = X payCurrency
      return { 
        leftValue: '1', 
        leftCoin: receiveCurrency, 
        rightValue: preTradeData.price, 
        rightCoin: payCurrency 
      };
    } else {
      // 默认：显示 1 payCurrency = X receiveCurrency
      return { 
        leftValue: '1', 
        leftCoin: payCurrency, 
        rightValue: preTradeData.price, 
        rightCoin: receiveCurrency 
      };
    }
  }

  const exchangeRateDisplay = getExchangeRateDisplay();

  // Reset flip state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setIsRateFlipped(false);
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered
      width={470}
    >
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{t('confirmModal.title')}</ModalTitle>
          <CloseButton onClick={onClose}>
            <CloseOutlined />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <ExchangeInfo>
            <CurrencySection>
              <ModalCurrencyIcon>
                <Image src={displayInfo.sendIcon} alt={displayInfo.sendCoin} preview={false} style={{ width: '100%', height: '100%' }} />
              </ModalCurrencyIcon>
              <CurrencyDirection>{t('confirmModal.from')}</CurrencyDirection>
              <CurrencyAmount>{displayInfo.sendAmount} {displayInfo.sendCoin}</CurrencyAmount>
            </CurrencySection>
            <ArrowIcon>
              <ArrowRightOutlined />
            </ArrowIcon>
            <CurrencySection>
              <ModalCurrencyIcon>
                <Image src={displayInfo.receiveIcon} alt={displayInfo.receiveCoin} preview={false} style={{ width: '100%', height: '100%' }} />
              </ModalCurrencyIcon>
              <CurrencyDirection>{t('confirmModal.to')}</CurrencyDirection>
              <CurrencyAmount>{displayInfo.receiveAmount} {displayInfo.receiveCoin}</CurrencyAmount>
            </CurrencySection>
          </ExchangeInfo>

          <ExchangeDetails>
            <DetailRow>
              <Tooltip title={t('exchangeRateTooltip')}>
                <DetailLabel style={{ textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: '4px', cursor: 'pointer' }}>{t('confirmModal.exchangeRate')}</DetailLabel>
              </Tooltip>
              <DetailValue>
                {exchangeRateDisplay.leftValue}{exchangeRateDisplay.leftCoin} = {exchangeRateDisplay.rightValue} {exchangeRateDisplay.rightCoin} 
                <SwapOutlined 
                  style={{ fontSize: '12px', marginLeft: '5px', cursor: 'pointer' }}
                  onClick={toggleExchangeRate}
                />
              </DetailValue>
            </DetailRow>

            <DetailRow>
                <DetailLabel style={{ cursor: 'pointer' }}>{t('confirmModal.tradingFee')}</DetailLabel>
              <DetailValue className="fee">{t('confirmModal.zeroFee')}</DetailValue>
            </DetailRow>

            <DetailRow>
              <Tooltip title={t('exchangeRateTooltip')}>
                <DetailLabel style={{ textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: '4px', cursor: 'pointer' }}>{t('confirmModal.youWillPay')}</DetailLabel>
              </Tooltip>
              <DetailValue>{displayInfo.sendAmount} {displayInfo.sendCoin}</DetailValue>
            </DetailRow>
          </ExchangeDetails>

          {priceExpired && (
            <PriceExpiredAlert>
              <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
              {t('confirmModal.priceExpired')}
            </PriceExpiredAlert>
          )}

          <Button
            onClick={refreshCount >= 5 && priceExpired ? onRefreshPrice : onConfirm}
            loading={isLoading}
            type='primary' 
            shape='round'
            style={{width:'100%',height:'50px'}}
          >
            {refreshCount >= 5 && priceExpired 
              ? t('confirmModal.refreshPrice')
              : countdown > 0 
                ? t('confirmModal.exchangeWithCountdown', { seconds: countdown }) 
                : t('confirmModal.exchange')
            }
          </Button>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

// Modal Styled Components
const ModalContainer = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--background-color);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color4);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
`;

const ModalContent = styled.div`
  padding:35px;
`;

const ExchangeInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const CurrencySection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const ModalCurrencyIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  
  &.usdt {
    background-color: #26A17B;
  }
  
  &.btc {
    background-color: #F7931A;
  }
`;

const CurrencyDirection = styled.div`
  color: #999;
  margin-bottom: 5px;
`;

const CurrencyAmount = styled.div`
  font-weight: 500;
`;

const ArrowIcon = styled.div`
  color: #999;
  font-size: 24px;
  margin: 0 15px;
`;

const ExchangeDetails = styled.div`
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
   border:1px solid var(--border-color4);
   font-sze:14px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  color: #666;
`;

const DetailValue = styled.div`
  font-weight: 500;
  
  &.fee {
    color: #ff5722;
  }
`;

const PriceExpiredAlert = styled.div`
  background-color: #FF8A2614;
  border-radius: 4px;
  padding: 10px 15px;
  color: #FF8A26;
  display: flex;
  align-items: center;
  margin: 30px 0;
  
`;



// Success Modal Component
interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  tradeResult: any;
  router: NextRouter; // Add router prop
  isDayMode: boolean;
}


const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose, tradeResult, router,isDayMode}) => {
  const { t } = useTranslation(['flash','common']);

  const goAssest = async () => {
    if (!router.isReady) {
      console.warn("SuccessModal router not ready for goAssest navigation.");
      return;
    }
          router.push('/assets/assetsAccount');

  }
 

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered
      width={470}
    >
      <ModalContainer>
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
             <Image src={isDayMode ? '/images/flash/success.svg' : '/images/flash/success_dark.png'} width={160} height={100} alt="" preview={false} />
             </div>
          </div>
          
          <h2 style={{ fontSize: '20px', margin: '0 0 5px 0' }}>{t('successModal.title')}</h2>
          <p style={{ fontSize: '12px', margin: '0 0 20px 0' }}>{tradeResult?.sendAmount} {tradeResult?.sendCoin}</p>
          
          <div style={{ 
            border: '1px solid var(--border-color4)', 
            borderRadius: '8px', 
            padding: '15px',
            marginBottom: '20px',
           
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{color:'var(--text-color6)'}}>{t('successModal.youReceived')}</span>
              <span>{tradeResult?.receiveAmount} {tradeResult?.receiveCoin}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{color:'var(--text-color6)'}}>{t('successModal.exchangeRate')}</span>
              <span>1{tradeResult?.sendCoin} = {tradeResult?.exchangeRate} {tradeResult?.receiveCoin}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{color:'var(--text-color6)'}}>{t('successModal.tradingFee')}</span>
              <span>0</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px',justifyContent:'center' }}>
            <Button 
              onClick={onClose} 
              shape="round"
              style={{width:'100px',height:'40px'}}
            >
              {t('successModal.ok')}
            </Button>
            <Button 
              type="primary" 
              shape="round"
              onClick={goAssest}
              style={{width:'100px',height:'40px'}}
            >
              {t('successModal.goToAssets')}
            </Button>
          </div>
        </div>
      </ModalContainer>
    </Modal>
  );
};

// Failure Modal Component
interface FailureModalProps {
  visible: boolean;
  onClose: () => void;
  isDayMode: boolean;
}

const FailureModal: React.FC<FailureModalProps> = ({ visible, onClose,isDayMode }) => {
  const { t } = useTranslation(['flash','common']);
  
  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered
      width={470}
      styles={{
        body: {
          padding: '0px'
        }
      }}
    >
      <ModalContainer>
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{  
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <Image src={isDayMode ? '/images/flash/fail.svg' : '/images/flash/fail_dark.png'} width={160} height={100} alt="" preview={false} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '20px', margin: '0 0 5px 0',fontWeight:'500' }}>{t('failureModal.title')}</h2>
          <p style={{ fontSize: '20px',  margin: '0 0 20px 0' }}>{t('failureModal.description')}</p>
          
          <div style={{ display: 'flex', gap: '10px',justifyContent:'center' }}>
          <Button 
              type="primary" 
              shape="round"
              style={{width:'100px',height:'40px'}}
            >
              {t('failureModal.viewAssets')}
            </Button>
            <Button 
              onClick={onClose} 
              shape="round"
              style={{width:'100px',height:'40px'}}
            >
              {t('failureModal.ok')}
            </Button>
           
          </div>
        </div>
      </ModalContainer>
    </Modal>
  );
};

export default FlashPage;


