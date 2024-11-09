import type { ComponentProps } from 'react';
import { TextInput, View } from 'react-native';

export function Input(props: InputProps) {
	return (
		<View className="w-full">
			<TextInput
				className="px-4 h-14 border-2 border-gray-300 rounded-lg bg-white/10 text-black text-base"
				placeholderTextColor="black"
				{...props}
			/>
		</View>
	);
}

type InputProps = Omit<ComponentProps<typeof TextInput>, "className">