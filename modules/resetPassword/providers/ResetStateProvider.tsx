
import {
	type PropsWithChildren,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";
export enum ResetStateEnum {
	INPUT = 0,
	SENTCODE = 1,
	RESET = 2,
}


interface ResetStateContextType {
	resetState: ResetStateEnum;
	setResetState: (resetState: ResetStateEnum) => void;
	acount: string ;
    setAcount: (acount: string ) => void
}

const ResetStateContext = createContext<ResetStateContextType>({
	resetState: ResetStateEnum.INPUT,
	setResetState: () => {},
	acount: '',
    setAcount: () => {},
});
export function useResetStateContext() {
	const context = useContext(ResetStateContext);
	return context;

}

export function ResetStateProvider({ children }: PropsWithChildren) {
	const [resetState, setResetState] = useState(ResetStateEnum.INPUT);
	const [acount, setAcount] = useState<string>('');

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: ResetStateContextType = useMemo(
		() => ({ resetState, setResetState,acount, setAcount}),
		[resetState,acount],
	);

	return (
		<ResetStateContext.Provider value={value}>
			{children}
		</ResetStateContext.Provider>
	);
}





