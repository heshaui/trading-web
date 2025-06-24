import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled from 'styled-components';
import { Button, Input, Select, Collapse, Modal, Spin, Image,Tooltip } from 'antd';
import { DownOutlined, SwapOutlined, InfoCircleOutlined, CloseOutlined, ArrowRightOutlined, ExclamationCircleOutlined, CheckOutlined } from '@ant-design/icons';
import { getConfig, trade, getPrice,preTrade } from '@/services/flash';
import { getCoinAll } from '@/services/assets';
import { useRouter, NextRouter } from 'next/router';
import { getUserBalanceAll } from '@/services/assets';
import SpotBuyModal from '@/components/spotModal/placeOrder_modal';
import appStore from '@/store';



const { Panel } = Collapse;


const FlashPage: NextPage = () => {

  const { t } = useTranslation(['spot','common']);
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
  const [coinList, setCoinList] = useState<any[]>([]);
  const [baseCoin, setBaseCoin] = useState<string>('');
  const [quteCoin, setQuteCoin] = useState<string>('');
  const [userAll,setUserAll] = useState<any[]>([]);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [refreshCount, setRefreshCount] = useState<number>(0); // 重新请求次数计数器

  // 从 store 获取闪兑配置数据
  const configData = appStore.getFlashConfig();

  const flashConfigData = appStore.getKvConfig('flash_img');
  const langKey = appStore.getLang() || 'en_US';
  
  const headerBgImage = flashConfigData?.[langKey]?.img;

  const headerTitle = flashConfigData && flashConfigData[langKey] 
                        ? flashConfigData[langKey].title 
                        : '';
  const headerSubtitle = flashConfigData && flashConfigData[langKey] 
                        ? flashConfigData[langKey].subTitle 
                        : '';
  
  // Custom select component with icon display
  const IconSelect = ({ value, options, onChange, style }: any) => {
    // Find the selected option to display its icon
    const selectedOption = options.find((opt: any) => opt.value === value);

    return (
      <Select
        value={value}
        onChange={onChange}
        bordered={false}
        style={style || { width: '100px' }}
        dropdownStyle={{ padding: '4px' }}
        suffixIcon={<DownOutlined style={{ fontSize: '12px', color: '#666' }} />}
        menuItemSelectedIcon={null}
        showSearch={false}
        // Custom display for selected item
        dropdownRender={(menu) => (
          <div style={{ padding: '4px' }}>{menu}</div>
        )}
      >
        {options.map((option: any) => (
          <Select.Option key={option.value} value={option.value}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Image
                src={option.icon}
                alt={option.label}
                preview={false}
                style={{ width: '20px', height: '20px',borderRadius:'50%' }}
              />
              <span>{option.label}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    );
  };


  const router = useRouter();
  const [spotModal, setSpotModal] = useState<boolean>(false);


  const getUserAllBala=async()=>{
   const res=await getUserBalanceAll()
    if(res.code==='0'){
      setUserAll(res.data)
    }
  }

  const gerFlashConfig = async () => {
    const data={}
    const res = await getConfig(data)
    if (res.code === '0') {
      setBaseCoin(res.data.baseCoin)
      setQuteCoin(res.data.quoteCoin)


    }

  }

  const getCoinAllList = async () => {

    const res = await getCoinAll()
    if (res.code === '0') {
      setCoinList(res.data)
      await getFlashPrice()
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
      console.log('Flash price response:', res)
      if (res.code === '0') {
        setExchangeRate(res.data)
        // When exchange rate is updated, recalculate receive amount if pay amount exists
        if (payAmount && !isNaN(Number(payAmount)) && !isNaN(Number(res.data))) {
          const calculatedAmount = (Number(payAmount) * Number(res.data)).toFixed(8);
          setReceiveAmount(calculatedAmount);
        }
      }
    } catch (error) {
      console.error('Failed to get flash price:', error)
    }
  }

  const handleConfirm = async () => {
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
        // Store trade result for display in success modal
        setTradeResult({
          sendAmount: payAmount,
          sendCoin: baseCoin,
          receiveAmount: receiveAmount,
          receiveCoin: quteCoin,
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
    
    // Update the exchange rate after swapping - will be triggered by useEffect when coins change
  }


  useEffect(() => {
    getCoinAllList()
    gerFlashConfig()
    getUserAllBala()
    const userInfo = localStorage.getItem('imbit_userInfo');
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      setIsAuth(parsedInfo.realnessStatus === 1);
    }

  }, [])

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
    if (payAmount && exchangeRate && !isNaN(Number(payAmount)) && !isNaN(Number(exchangeRate))) {
      const calculatedAmount = (Number(payAmount) * Number(exchangeRate)).toFixed(8);
      setReceiveAmount(calculatedAmount);
    }
  }, [payAmount, exchangeRate])

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
        <title>{t('闪兑')} | {t('Trading Platform')}</title>
      </Head>
      <PageContainer>
        <Header bgImage={headerBgImage}>
          <h1>{headerTitle}</h1>
          <HeaderSubtitle>{headerSubtitle}</HeaderSubtitle>
        </Header>
        { configData?.realNameRequired&&!isAuth&&<AuthNoticeWrapper>
          <Image src='/images/flash/identy.png' width={80} height={74} alt="" preview={false} />
          <NoticeContent>
            <NoticeTitle>未完成身份认证</NoticeTitle>
            <NoticeDescription>完成身份认证，解锁全部功能</NoticeDescription>
          </NoticeContent>
          <Button type="primary" shape="round" onClick={()=>router.push('/userCenter/identity')}>立即认证</Button>
        </AuthNoticeWrapper>}
        <div style={{display:'flex',justifyContent:'flex-end',width:'700px',cursor:'pointer',marginTop:'26px' }}>
          <div style={{display:'flex',alignItems:'center'}}>
          <Image src='/images/flash/dayFrame.png' width={20} height={20} alt="" preview={false} /> <p style={{marginLeft:'5px',marginRight:'12px'}} onClick={() => goPage(1)}>现货交易</p>

          </div>
          <div style={{display:'flex',alignItems:'center'}}>
          <Image src='/images/flash/dayOrder.png' width={20} height={20} alt="" preview={false} /><p style={{marginLeft:'5px'}} onClick={() => goPage(2)}>订单记录</p>
          </div>
             
            </div>
        <ContentWrapper>

      
          <TradeContainer>
            <TradeSection>
              <TradeLabel>支付</TradeLabel>
              <TradeInputWrapper>
                <StyledInput
                   placeholder={`${configData?.minTradeU}-${configData?.maxTradeU}`}
                  value={payAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPayAmount(value);
                    // Calculate receive amount when pay amount changes
                    if (value && exchangeRate && !isNaN(Number(value)) && !isNaN(Number(exchangeRate))) {
                      const calculatedAmount = (Number(value) * Number(exchangeRate)).toFixed(8);
                      setReceiveAmount(calculatedAmount);
                    }
                  }}
                />
                <MaxLabel 
                  style={{ borderRight: '1px solid #DCDCDC', paddingRight: '4px', cursor: 'pointer' }}
                  onClick={() => {
                    const currentCoin = userAll.find(item => item.coinName === baseCoin);
                    if (currentCoin && currentCoin.balance) {
                      setPayAmount(currentCoin.balance);
                      // Also calculate the receive amount based on the max balance
                      if (exchangeRate && !isNaN(Number(exchangeRate)) && !isNaN(Number(currentCoin.balance))) {
                        const calculatedAmount = (Number(currentCoin.balance) * Number(exchangeRate)).toFixed(8);
                        setReceiveAmount(calculatedAmount);
                      }
                    }
                  }}
                >最大</MaxLabel>
                <IconSelect
                  value={baseCoin}
                  onChange={setBaseCoin}
                  style={{ width: '100px' }}
                  options={coinList.filter(item => item.isTradeConvert !== 0).map(item=>({
                    label: item.coinName,
                    value: item.coinName,
                    icon: item.iconUrl
                  }))}
                />



              </TradeInputWrapper>
             
            </TradeSection>
             <AvailableAmount>现货可用 {userAll.find(item=>item.coinName===baseCoin)?.balance} {baseCoin} <Image src='/images/flash/add.png' style={{marginTop:'3px',cursor:'pointer'}} width={16} height={16} alt="" preview={false} onClick={()=>{setSpotModal(true)}} /></AvailableAmount>
             {/* 余额不足提示 */}
             {payAmount && baseCoin && userAll.find(item=>item.coinName===baseCoin) && 
              Number(payAmount) > Number(userAll.find(item=>item.coinName===baseCoin)?.balance || 0) && (
                <InsufficientBalanceAlert>
                  现货账户余额不足，前往充值
                </InsufficientBalanceAlert>
              )}

            <SwapButtonWrapper>
              <SwapButton onClick={swapCoins}>
                <SwapOutlined style={{ color: '#fff', fontSize: '20px' }} />
              </SwapButton>
            </SwapButtonWrapper>

            <TradeSection>
              <TradeLabel>获得</TradeLabel>
              <TradeInputWrapper>
                <StyledInput
                  placeholder={`${configData?.minTradeU}-${configData?.maxTradeU}`}
                  value={receiveAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setReceiveAmount(value);
                    // Calculate pay amount when receive amount changes
                    if (value && exchangeRate && !isNaN(Number(value)) && !isNaN(Number(exchangeRate)) && Number(exchangeRate) > 0) {
                      const calculatedPayAmount = (Number(value) / Number(exchangeRate)).toFixed(8);
                      setPayAmount(calculatedPayAmount);
                    }
                  }}
                />
                <MaxLabel 
                  style={{ borderRight: '1px solid #DCDCDC', paddingRight: '4px', cursor: 'pointer' }}
                  onClick={() => {
                    const currentCoin = userAll.find(item => item.coinName === quteCoin);
                    if (currentCoin && currentCoin.balance) {
                      setReceiveAmount(currentCoin.balance);
                      // Also calculate the pay amount based on the max receive amount
                      if (exchangeRate && !isNaN(Number(exchangeRate)) && !isNaN(Number(currentCoin.balance)) && Number(exchangeRate) > 0) {
                        const calculatedPayAmount = (Number(currentCoin.balance) / Number(exchangeRate)).toFixed(8);
                        setPayAmount(calculatedPayAmount);
                      }
                    }
                  }}
                >最大</MaxLabel>
                <IconSelect
                  value={quteCoin}
                  onChange={setQuteCoin}
                  style={{ width: '100px' }}
                  options={coinList.filter(item => item.isTradeConvert !== 0).map(item=>({
                    label: item.coinName,
                    value: item.coinName,
                    icon: item.iconUrl
                  }))}
                />



              </TradeInputWrapper>

            </TradeSection>
                          <MarketPrice>
                            <Tooltip title="兑换比例为预估值，最终兑换数量已实际成交为准">
                <span style={{ textDecoration: 'underline', textDecorationStyle: 'dashed',cursor:'pointer'}}>
                兑换比例:  </span>{!exchangeRate || !payAmount? '--': `1${baseCoin} ≈ ${exchangeRate} ${quteCoin}`}
                </Tooltip>
              </MarketPrice>

            <Button onClick={() => handleConfirm()} type='primary' style={{width:'100%',height:'50px'}} shape="round" disabled={!isAuth}>预览</Button>

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
              onConfirm={() => {
                setIsLoading(true)
                // Simulate API call
                handleTrade()
              }}
              onRefreshPrice={async () => {
                await getPreTrade();
                setRefreshCount(prev => prev + 1);
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
              router={router} // Pass router instance
            />
            )}
            
            {/* Failure Modal */}
            <FailureModal
              visible={isFailureModalVisible}
              onClose={() => setIsFailureModalVisible(false)}
            />
          </TradeContainer>



          <FooterText>您可以随时使用闪兑服务换取数字资产！</FooterText>
        </ContentWrapper>
        <FAQSection>
            <FAQTitle>常见问题</FAQTitle>
            <StyledCollapse expandIconPosition="end">
              {/* Using default expand icon */}
              <Panel
                header="如何使用闪兑交易功能?"
                key="1"
              >
                <p>选择您需要兑换的币种并输入兑换金额，我们将提供最优汇率。如果您对当前汇率满意，点击兑换后，获得币种将发送至您的现货账户。兑换前请确保现货账户余额充足，如果您在使用过程中有任何问题请及时与我们的客服沟通。</p>
              </Panel>
              <Panel
                header="闪兑功能是否收取手续费？"
                key="2"
              >
                <p>闪兑不收取手续费，预览兑换时，显示的资产报价数量是您账户中将实际收到的数量。</p>
              </Panel>
              <Panel
                header="闪兑和现货交易有什么不同？"
                key="3"
              >
                <p>不同于订单撮合模式，闪兑使用的是柜台报价模式，不产生任何交易手续费。因此，闪兑价格与现货盘口价格存在一定的差价。首先用户基于特定币对进行询价，系统会根据当前市场提供一个有竞争力的价格，如果用户接受了柜台的报价，点击确认后就可以快速交易。交易之前确保您的余额充足。</p>
              </Panel>
              <Panel
                header="闪兑获得的资产在哪里查看？"
                key="4"
              >
                <p>闪兑获得币种资产将自动划转至您的现货账户。</p>
              </Panel>
              <Panel
                header="如何查看闪兑交易订单？"
                key="5"
              >
                <p>您可以在闪兑页面点击右上角订单记录查看，或者点击订单中心- 闪兑订单进行查看。</p>
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

`;

const TradeSection = styled.div`

  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 15px;
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
`;

const StyledInput = styled(Input)`
  border: none;
  flex: 1;
  &:focus {
    box-shadow: none;
  }
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
  color: #ff5722;
  margin-top: 5px;
  margin-bottom: 20px;
  text-align: left;
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
  margin-bottom: 30px;
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
    border-bottom: 1px solid #f0f0f0;
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
      ...(await serverSideTranslations(locale, ['common','spot'])),
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
  preTradeData
}) => {
  // Find the coin icons for the selected currencies
  const findCoinIcon = (coinName: string) => {
    const coin = coinList.find((coin: any) => coin.coinName === coinName)
    return coin ? coin.iconUrl : ''
  }
  
  const payIcon = findCoinIcon(payCurrency)
  const receiveIcon = findCoinIcon(receiveCurrency)
  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered
      width={470}
      bodyStyle={{ padding: 0 }}
    >
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>确认兑换</ModalTitle>
          <CloseButton onClick={onClose}>
            <CloseOutlined />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <ExchangeInfo>
            <CurrencySection>
              <ModalCurrencyIcon>
                <Image src={payIcon} alt={payCurrency} preview={false} style={{ width: '100%', height: '100%' }} />
              </ModalCurrencyIcon>
              <CurrencyDirection>从</CurrencyDirection>
              <CurrencyAmount>{payAmount} {payCurrency}</CurrencyAmount>
            </CurrencySection>

            <ArrowIcon>
              <ArrowRightOutlined />
            </ArrowIcon>

            <CurrencySection>
              <ModalCurrencyIcon>
                <Image src={receiveIcon} alt={receiveCurrency} preview={false} style={{ width: '100%', height: '100%' }} />
              </ModalCurrencyIcon>
              <CurrencyDirection>至</CurrencyDirection>
              <CurrencyAmount>{receiveAmount} {receiveCurrency}</CurrencyAmount>
            </CurrencySection>
          </ExchangeInfo>

          <ExchangeDetails>
            <DetailRow>
              <DetailLabel>兑换率</DetailLabel>
              <DetailValue>
                1{payCurrency} = {preTradeData?.price} {receiveCurrency} <SwapOutlined style={{ fontSize: '12px', marginLeft: '5px' }} />
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>交易手续费</DetailLabel>
              <DetailValue className="fee">0手续费</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>您将支付</DetailLabel>
              <DetailValue>{payAmount} {payCurrency}</DetailValue>
            </DetailRow>
          </ExchangeDetails>

          {priceExpired && (
            <PriceExpiredAlert>
              <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
              该报价已过期，请重新获取报价
              {refreshCount >= 5 && (
                <div style={{ marginTop: '5px', fontSize: '12px' }}>
                  已达到最大重试次数，请手动刷新
                </div>
              )}
            </PriceExpiredAlert>
          )}

          <Button
            onClick={onConfirm}
            loading={isLoading}
            type='primary' 
            shape='round'
            style={{width:'100%',height:'50px'}}
          >
            {countdown > 0 ? `兑换 (${countdown}S)` : '兑换'}
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
  border-bottom: 1px solid #f0f0f0;
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
  padding: 20px;
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
   border:1px solid #DCDCDC;
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
  background-color: #FFF7E6;
  border-radius: 4px;
  padding: 10px 15px;
  color: #D46B08;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;



// Success Modal Component
interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  tradeResult: any;
  router: NextRouter; // Add router prop
}


const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose, tradeResult, router }) => {

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
      bodyStyle={{ padding: 0 }}
    >
      <ModalContainer>
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              border: '2px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: '#fff'
            }}>
              <div style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 87, 34, 0.1)',
                zIndex: 0
              }} />
              <CheckOutlined style={{ fontSize: '40px', color: '#FF5722', zIndex: 1 }} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>成功</h2>
          <p style={{ fontSize: '16px', color: '#666', margin: '0 0 20px 0' }}>{tradeResult?.sendAmount} {tradeResult?.sendCoin}</p>
          
          <div style={{ 
            border: '1px solid #DCDCDC', 
            borderRadius: '8px', 
            padding: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>您已收到</span>
              <span>{tradeResult?.receivedAmount} {tradeResult?.receiveCoin}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>兑换率</span>
              <span>1{tradeResult?.sendCoin} = {tradeResult?.exchangeRate} {tradeResult?.receiveCoin}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>交易手续费</span>
              <span>0</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button 
              onClick={onClose} 
              style={{ flex: 1, height: '50px' }}
              shape="round"
            >
              好的
            </Button>
            <Button 
              type="primary" 
              style={{ flex: 1, height: '50px' }} 
              shape="round"
              onClick={goAssest}
            >
              前往资产
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
}

const FailureModal: React.FC<FailureModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered
      width={470}
      bodyStyle={{ padding: 0 }}
    >
      <ModalContainer>
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              border: '2px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: '#fff'
            }}>
              <div style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 87, 34, 0.1)',
                zIndex: 0
              }} />
              <CloseOutlined style={{ fontSize: '40px', color: '#FF5722', zIndex: 1 }} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>下单失败</h2>
          <p style={{ fontSize: '16px', color: '#666', margin: '0 0 20px 0' }}>兑换率失效，交易取消！</p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button 
              onClick={onClose} 
              style={{ flex: 1, height: '50px', width: '100%' }}
              shape="round"
            >
              好的
            </Button>
            <Button 
              type="primary" 
              style={{ flex: 1, height: '50px' }} 
              shape="round"
            >
              查看资产
            </Button>
          </div>
        </div>
      </ModalContainer>
    </Modal>
  );
};

export default FlashPage;


