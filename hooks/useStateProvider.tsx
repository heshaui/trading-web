
import {
	type PropsWithChildren,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";



interface ResetStateContextType {
	resetState: boolean;
	setResetState: (resetState: boolean) => void;
}

const ResetStateContext = createContext<ResetStateContextType>({
	resetState: false,
	setResetState: () => { },
});
export function useResetStateContext() {
	const context = useContext(ResetStateContext);
	return context;

}

export function ResetStateProvider({ children }: PropsWithChildren) {
	const [resetState, setResetState] = useState(false);


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





