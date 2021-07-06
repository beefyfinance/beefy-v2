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
    summary: {
        '& .MuiTypography-h1': {
            fontSize: '42px',
            lineHeight: '54px',
            fontWeight: 600,
            letterSpacing: '0.5px',
        },
        '& .MuiTypography-body1': {
            fontSize: '18px',
            lineHeight: '24px',
            color: '#8585A6',
            letterSpacing: '0.2px',
        }
    },
    partner: {
        padding: '32px',
        borderRadius: '20px',
    },
    social: {
        textAlign: 'right',
        '& .MuiLink-root': {
            color: '#ffffff',
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0.1px',
            marginLeft: '10px',
        }
    },
    partnerBody: {
        marginTop: '20px',
    },
    splitPaper: {
        borderRadius: '20px',
    },
    splitA: {
        backgroundColor: '#272B4A',
        width: '50%',
        borderTopLeftRadius: '20px',
        borderBottomLeftRadius: '20px',
        padding: '32px',
    },
    splitB: {
        backgroundColor: '#313759',
        width: '50%',
        borderTopRightRadius: '20px',
        borderBottomRightRadius: '20px',
        padding: '32px',
    }
});

export default styles;
