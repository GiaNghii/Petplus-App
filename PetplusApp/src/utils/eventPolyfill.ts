// Workaround for React 19 + react-native-web event delegation bug
// Manually routes native click events to React fiber onClick handlers

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('click', function (e: MouseEvent) {
    let target: any = e.target;
    while (target) {
      const fiberKey = Object.keys(target).find((k: string) =>
        k.startsWith('__reactFiber')
      );
      if (fiberKey) {
        let node = (target as any)[fiberKey];
        while (node) {
          const props = node.memoizedProps;
          if (props && typeof props.onClick === 'function') {
            props.onClick(e);
            e.preventDefault();
            return;
          }
          if (
            props &&
            props.onPress &&
            typeof props.onPress === 'function'
          ) {
            props.onPress(e);
            e.preventDefault();
            return;
          }
          node = node.return;
        }
      }
      target = (target as Element).parentElement;
    }
  });
}
