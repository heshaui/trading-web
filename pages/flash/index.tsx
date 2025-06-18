import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled from 'styled-components';
import { Button, Input, Select, Collapse, Modal, Spin, Image,Tooltip } from 'antd';
import { DownOutlined, SwapOutlined, InfoCircleOutlined, CloseOutlined, ArrowRightOutlined, ExclamationCircleOutlined, CheckOutlined } from '@ant-design/icons';
import { getConfig, trade, getPrice } from '@/services/flash';
import { getCoinAll } from '@/services/assets';
import { useRouter } from 'next/router';
import { getUserBalanceAll } from '@/services/assets';


const { Panel } = Collapse;

const LoadingIndicator = styled.div`
  font-size: 12px;
  color: #ff5722;
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;

const ErrorMessage = styled.div`
  font-size: 12px;
  color: red;
  margin-top: 5px;
  text-align: center;
`;

const FlashPage: NextPage = () => {

  const { t } = useTranslation('common');
  const [payAmount, setPayAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [priceExpired, setPriceExpired] = useState<boolean>(false);
  const [configData, setConfigData] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Success and failure modal states
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);
  const [isFailureModalVisible, setIsFailureModalVisible] = useState<boolean>(false);
  const [tradeResult, setTradeResult] = useState<any>(null);

  // 币种列表数据
  const [coinList, setCoinList] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<string>('ETH');
  const [baseCoin, setBaseCoin] = useState<string>('');
  const [quteCoin, setQuteCoin] = useState<string>('');
  const [userAll,setUserAll] = useState<any[]>([]);
  
  const [isAuth, setIsAuth] = useState<boolean>(false);
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
                style={{ width: '20px', height: '20px' }}
              />
              <span>{option.label}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    );
  };

  const [coinLoading, setCoinLoading] = useState<boolean>(false);
  const [coinError, setCoinError] = useState<string | null>(null);


  const getUserAllBala=async()=>{
   const res=await getUserBalanceAll()
    if(res.code==='0'){
      setUserAll(res.data)
    }
  }

  const gerFlashConfig = async () => {
    const res = await getConfig()
    if (res.code === '0') {
      setBaseCoin(res.data.baseCoin)
      setQuteCoin(res.data.quoteCoin)
      // setExchangeRate(res.data.feeRate)
    }

  }

  const getCoinAllList = async () => {

    const res = await getCoinAll()
    if (res.code === '0') {
      setCoinList(res.data)
      await getFlashPrice()
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
      }
    } catch (error) {
      console.error('Failed to get flash price:', error)
    }
  }

  const handleConfirm = async () => {
    setIsConfirmModalVisible(true)
   
    
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
   const userInfo= localStorage.getItem('imbit_userInfo')
   if(userInfo){
    JSON.parse(userInfo).realnessStatus===1 ? setIsAuth(true) : setIsAuth(false)
   }


  }, [])

  useEffect(() => {
    getFlashPrice()
  }, [baseCoin, quteCoin])

  return (
    <>
      <Head>
        <title>{t('闪兑')} | {t('Trading Platform')}</title>
      </Head>
      <PageContainer>
        <Header>
          <h1>闪兑</h1>
          <HeaderSubtitle>0手续费 | 简单快捷 | 即可完成</HeaderSubtitle>
          {configLoading && <LoadingIndicator>加载配置中 <Spin size="small" /></LoadingIndicator>}
          {configError && <ErrorMessage>{configError}</ErrorMessage>}
          {coinLoading && <LoadingIndicator>加载币种列表中 <Spin size="small" /></LoadingIndicator>}
          {coinError && <ErrorMessage>{coinError}</ErrorMessage>}
        </Header>
        { !isAuth&&<AuthNoticeWrapper>
          <Image src='/images/flash/identy.png' width={80} height={74} alt="" preview={false} />
          <NoticeContent>
            <NoticeTitle>未完成身份认证</NoticeTitle>
            <NoticeDescription>完成身份认证，解锁全部功能</NoticeDescription>
          </NoticeContent>
          <Button type="primary" shape="round">立即认证</Button>
        </AuthNoticeWrapper>}
        <ContentWrapper>


          <TradeContainer>
            <TradeSection>
              <TradeLabel>支付</TradeLabel>
              <TradeInputWrapper>
                <StyledInput
                  placeholder="1-1000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
                <MaxLabel style={{ borderRight: '1px solid #DCDCDC', paddingRight: '4px' }}>最大</MaxLabel>
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
             <AvailableAmount>可用 {userAll.find(item=>item.coinName===baseCoin)?.balance} {baseCoin}</AvailableAmount>

            <SwapButtonWrapper>
              <SwapButton onClick={swapCoins}>
                <SwapOutlined style={{ color: '#fff', fontSize: '20px' }} />
              </SwapButton>
            </SwapButtonWrapper>

            <TradeSection>
              <TradeLabel>获得</TradeLabel>
              <TradeInputWrapper>
                <StyledInput
                  placeholder="1-1000"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(e.target.value)}
                />
                <MaxLabel style={{ borderRight: '1px solid #DCDCDC', paddingRight: '4px' }}>最大</MaxLabel>
                <Select
                  value={quteCoin}
                  onChange={setQuteCoin}
                  bordered={false}
                  style={{ width: '100px' }}
                  dropdownStyle={{ padding: '4px' }}
                  suffixIcon={<DownOutlined style={{ fontSize: '12px', color: '#666' }} />}
                  labelInValue={false}
                  menuItemSelectedIcon={null}
                  dropdownMatchSelectWidth={true}
                >
                  {coinList.filter(item => item.isTradeConvert !== 0).map(coin => (
                    <Select.Option
                      key={coin.coinName}
                      value={coin.coinName}
                      label={coin.coinName}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Image src={coin.iconUrl} alt={coin.coinName} style={{ width: '20px', height: '20px' }} />
                        <span>{coin.coinName}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>



              </TradeInputWrapper>

            </TradeSection>
                          <MarketPrice>
                            <Tooltip title="兑换比例为预估值，最终兑换数量已实际成交为准">
                兑换比例: {configData && configData.exchangeRate ? configData.exchangeRate : '--'}
                </Tooltip>
              </MarketPrice>

            <Button onClick={() => handleConfirm()} type='primary' style={{width:'100%',height:'50px'}} shape="round" >兑换</Button>

            {/* Confirmation Modal */}
            <ConfirmExchangeModal
              visible={isConfirmModalVisible}
              onClose={() => setIsConfirmModalVisible(false)}
              payAmount={payAmount}
              payCurrency={baseCoin}
              receiveAmount={receiveAmount}
              receiveCurrency={quteCoin}
              exchangeRate={exchangeRate}
              isLoading={isLoading}
              priceExpired={priceExpired}
              coinList={coinList}
              onConfirm={() => {
                setIsLoading(true)
                // Simulate API call
                handleTrade()
              }}
              onRefreshPrice={() => {
                setPriceExpired(false);
              }}
            />
            
            {/* Success Modal */}
            <SuccessModal
              visible={isSuccessModalVisible}
              onClose={() => setIsSuccessModalVisible(false)}
              tradeResult={tradeResult}
            />
            
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
                <p>您可以在闪兑页面点击右上角"订单记录"查看，或者点击订单中心- 闪兑订单进行查看。</p>
              </Panel>
            </StyledCollapse>
          </FAQSection>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  background-color: #000;
  color: white;
  padding: 20px 0;
  text-align: center;
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
  background-color: white;
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
  margin-bottom: 30px;
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
  background-color: white;
  border-radius: 8px;
  padding: 20px;
`;

const FAQTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 18px;
`;

const StyledCollapse = styled(Collapse)`
  background-color: white;
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
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

// Confirmation Modal Component
interface ConfirmExchangeModalProps {
  visible: boolean;
  onClose: () => void;
  payAmount: string;
  payCurrency: string;
  receiveAmount: string;
  receiveCurrency: string;
  exchangeRate: string;
  isLoading: boolean;
  priceExpired: boolean;
  onConfirm: () => void;
  onRefreshPrice: () => void;
  coinList: any[];
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
  coinList
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
                1{payCurrency} = {exchangeRate} {receiveCurrency} <SwapOutlined style={{ fontSize: '12px', marginLeft: '5px' }} />
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
            </PriceExpiredAlert>
          )}

          <Button
            onClick={onConfirm}
            loading={isLoading}
            type='primary' 
            shape='round'
            style={{width:'100%',height:'50px'}}
          >
            兑换
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
  background-color: white;
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
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose, tradeResult }) => {
  const router = useRouter();
  const goAssest = async () => {
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