const regularText = {
    fontSize: '14px',
    fontWeight: 400,
    color: '#8585A6',
    letterSpacing: '0.2px',
}

const styles = theme => ({
    feeContainer: {
        backgroundColor: theme.palette.background.light,
        borderRadius: '10px',
    },
    title: {
        fontSize: '14px',
        lineHeight: '18px',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: '#8585A6',
    },
    value: {
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '0.2px',
        color: '#ffffff',
        paddingTop: '5px',
    },
    label: {
        ...regularText,
        paddingTop: 0,
    },
    text: {
        ...regularText,
        paddingTop: 5,
    },
    divider: {
        margin: '20px 0',
        color: '#8585A6',
    },
    feeBreakdownBlock: {
        marginBottom: 10
    },
    feeBreakdownBold: {
        fontSize: 18
    },
    feeBreakdownDetail: {
        ...regularText 
    },
    feeBreakdownDetailPerf: {
        ...regularText, 
		whiteSpace: 'pre', 
		tabSize: 10, 
    }
});

export default styles;
