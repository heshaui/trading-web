
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
}

const ResetStateContext = createContext<ResetStateContextType>({
	resetState: ResetStateEnum.INPUT,
	setResetState: () => {}
});
export function useResetStateContext() {
	const context = useContext(ResetStateContext);
	return context;
}

export function ResetStateProvider({ children }: PropsWithChildren) {
	const [resetState, setResetState] = useState(ResetStateEnum.INPUT);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: ResetStateContextType = useMemo(
		() => ({ resetState, setResetState }),
		[resetState],
	);

	return (
		<ResetStateContext.Provider value={value}>
			{children}
		</ResetStateContext.Provider>
	);
}





