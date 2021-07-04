const styles = (theme) => ({
    vaultContainer: {
        marginTop: '40px',
    },
    title: {
        marginTop: '40px',
        '& .MuiTypography-h1': {
            fontSize: '48px',
            lineHeight: '54px',
            fontWeight: 600,
            paddingLeft: '10px',
        },
        '& .MuiTypography-h2': {
            fontSize: '48px',
            lineHeight: '54px',
            fontWeight: 600,
            color: '#E88225',
        },
        '& .MuiAvatar-root': {
            width: 54,
            height: 54,
        },
    },
    btnGoBack: {
        fontSize: '14px',
        lineHeight: '18px',
        fontWeight: 600,
        color: '#6B7199',
        backgroundColor: '#14182B',
        letterSpacing: '0.2px',
        textTransform: 'inherit',
        borderRadius: '20px',
        padding: '6px 20px 6px 10px',
    },
});

export default styles;