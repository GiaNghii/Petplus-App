import { useWindowDimensions } from "react-native";
import { ViewStyle } from "react-native";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 768;
  const isTablet = width >= 640 && width < 768;
  const isMobile = width < 640;

  return { width, height, isDesktop, isTablet, isMobile };
}

export const desktopContainer: ViewStyle = {
  maxWidth: 1200,
  alignSelf: "center",
  width: "100%",
};

export function desktopPadding(isDesktop: boolean): ViewStyle {
  return {
    paddingHorizontal: isDesktop ? 48 : 16,
  };
}

export function gridItemWidth(
  columns: number,
  gap: number,
  containerWidth: number
): number {
  const totalGap = gap * (columns - 1);
  return (containerWidth - totalGap) / columns;
}
