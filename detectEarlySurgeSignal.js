export default function detectEarlySurgeSignal(stock) {
    if (!stock) return false;

    const volume = Number(stock.volume || 0);
    const changeRate = Number(stock.changeRate || 0);

    return (
        volume >= 3000000 &&
        changeRate >= 5
    );
}