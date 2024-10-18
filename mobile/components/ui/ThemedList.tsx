import { useThemeColor } from "@/hooks/useThemeColor";
import type React from "react";
import {
	FlatList,
	type FlatListProps,
	StyleSheet,
	Text,
	type TextStyle,
	TouchableOpacity,
	View,
	type ViewStyle,
} from "react-native";

export type ThemedListProps<ItemT> = Omit<FlatListProps<ItemT>, "renderItem"> & {
	renderItem: (item: ItemT, index: number) => React.ReactElement;
	itemSeparatorColor?: string;
	listHeaderComponent?: React.ReactElement;
	listFooterComponent?: React.ReactElement;
	onItemPress?: (item: ItemT) => void;
	itemStyle?: ViewStyle;
	itemTextStyle?: TextStyle;
};

export function ThemedList<ItemT>({
	data,
	renderItem,
	itemSeparatorColor,
	listHeaderComponent,
	listFooterComponent,
	onItemPress,
	itemStyle,
	itemTextStyle,
	...rest
}: ThemedListProps<ItemT>) {
	const backgroundColor = useThemeColor({}, "background");
	const textColor = useThemeColor({}, "text");
	const separatorColor = useThemeColor({ light: itemSeparatorColor, dark: itemSeparatorColor }, "icon");

	const renderListItem = ({ item, index }: { item: ItemT; index: number }) => (
		<TouchableOpacity onPress={() => onItemPress?.(item)} style={[styles.item, { backgroundColor }, itemStyle]}>
			{typeof renderItem === "function" ? (
				renderItem(item, index)
			) : (
				<Text style={[styles.itemText, { color: textColor }, itemTextStyle]}>{item as JSX.Element}</Text>
			)}
		</TouchableOpacity>
	);

	return (
		<FlatList
			data={data}
			renderItem={renderListItem}
			keyExtractor={(item, index) => index.toString()}
			ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: separatorColor }]} />}
			ListHeaderComponent={listHeaderComponent}
			ListFooterComponent={listFooterComponent}
			{...rest}
		/>
	);
}

const styles = StyleSheet.create({
	item: {
		padding: 15,
	},
	itemText: {
		fontSize: 16,
	},
	separator: {
		height: 1,
		width: "100%",
	},
});
