import { useRef, useEffect,useState } from 'react';
import styles from '../styles/spot.module.css';
import KlineChart from '@/components/KlineChart';
import TradingView from '@/components/TradingView';
import DepthChart from '@/components/DepthChart';
import OrderBook from '@/components/OrderBook';
import WebSocketService from "@/utils/websocket";

export default function SpotPage() {
  return <div className={styles.container}>

  </div>;
}