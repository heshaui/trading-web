import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled from 'styled-components';
import { Button, Input, Select, Collapse } from 'antd';
import { DownOutlined, SwapOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

const FlashPage: NextPage = () => {
  const { t } = useTranslation('common');
  const [payAmount, setPayAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('');
  
  return (
    <>
      <Head>
        <title>{t('闪兑')} | {t('Trading Platform')}</title>
      </Head>
      <PageContainer>
        <Header>
          <h1>闪兑</h1>
          <HeaderSubtitle>0手续费 | 简单快捷 | 即可完成</HeaderSubtitle>
        </Header>
        
        <ContentWrapper>
          <AuthNoticeWrapper>
            <NoticeIconWrapper>
              <InfoCircleOutlined style={{ color: '#fff', fontSize: '20px' }} />
            </NoticeIconWrapper>
            <NoticeContent>
              <NoticeTitle>未完成身份认证</NoticeTitle>
              <NoticeDescription>完成身份认证，解锁全部功能</NoticeDescription>
            </NoticeContent>
            <AuthButton>立即认证</AuthButton>
          </AuthNoticeWrapper>
          
          <TradeContainer>
            <TradeSection>
              <TradeLabel>支付</TradeLabel>
              <TradeInputWrapper>
                <StyledInput 
                  placeholder="1-1000" 
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
                <MaxLabel>最大</MaxLabel>
                <CurrencySelector>
                  <CurrencyIcon>USDT</CurrencyIcon>
                  <DownOutlined style={{ color: '#999', fontSize: '12px' }} />
                </CurrencySelector>
              </TradeInputWrapper>
              <AvailableAmount>可用可用 -- USDT</AvailableAmount>
            </TradeSection>
            
            <SwapButtonWrapper>
              <SwapButton>
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
                <MaxLabel>最大</MaxLabel>
                <CurrencySelector>
                  <CurrencyIcon>BTC</CurrencyIcon>
                  <DownOutlined style={{ color: '#999', fontSize: '12px' }} />
                </CurrencySelector>
              </TradeInputWrapper>
              <MarketPrice>兑换比例: --</MarketPrice>
            </TradeSection>
            
            <TradeButton>登录后兑换</TradeButton>
          </TradeContainer>
          
          <FAQSection>
            <FAQTitle>常见问题</FAQTitle>
            <StyledCollapse expandIconPosition="end">
              <Panel 
                header="如何使用闪兑交易功能?" 
                key="1"
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
              >
                <p>闪兑功能允许您快速交换不同的加密货币，无需手续费。只需输入您想要支付的金额，系统将自动计算您将获得的金额。</p>
              </Panel>
              <Panel 
                header="这是一个公告栏XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" 
                key="2"
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
              >
                <p>公告内容将在这里显示。</p>
              </Panel>
              <Panel 
                header="这是一个公告栏XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" 
                key="3"
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
              >
                <p>公告内容将在这里显示。</p>
              </Panel>
              <Panel 
                header="这是一个公告栏XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" 
                key="4"
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
              >
                <p>公告内容将在这里显示。</p>
              </Panel>
              <Panel 
                header="这是一个公告栏XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" 
                key="5"
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
              >
                <p>公告内容将在这里显示。</p>
              </Panel>
            </StyledCollapse>
          </FAQSection>
          
          <FooterText>您可以随时使用闪兑服务换取数字资产！</FooterText>
        </ContentWrapper>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f8f8f8;
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
  max-width: 700px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AuthNoticeWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
`;

const NoticeIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ff5722;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
`;

const NoticeContent = styled.div`
  flex: 1;
`;

const NoticeTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

const NoticeDescription = styled.div`
  color: #666;
  font-size: 14px;
`;

const AuthButton = styled(Button)`
  background-color: #ff5722;
  color: white;
  border: none;
  border-radius: 4px;
  &:hover {
    background-color: #e64a19;
    color: white;
  }
`;

const TradeContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TradeSection = styled.div`
  margin-bottom: 20px;
`;

const TradeLabel = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
`;

const TradeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 5px 10px;
`;

const StyledInput = styled(Input)`
  border: none;
  flex: 1;
  &:focus {
    box-shadow: none;
  }
`;

const MaxLabel = styled.span`
  color: #ff5722;
  margin-right: 10px;
  cursor: pointer;
`;

const CurrencySelector = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const CurrencyIcon = styled.div`
  margin-right: 5px;
  font-weight: bold;
`;

const AvailableAmount = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 5px;
`;

const MarketPrice = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 5px;
`;

const SwapButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: -10px 0;
  position: relative;
  z-index: 1;
`;

const SwapButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ff5722;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const TradeButton = styled(Button)`
  width: 100%;
  height: 50px;
  background-color: #ff5722;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 25px;
  margin-top: 20px;
  &:hover {
    background-color: #e64a19;
    color: white;
  }
`;

const FAQSection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

export default FlashPage;