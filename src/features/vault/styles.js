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
        '& .MuiAvatar-root': {
            width: 54,
            height: 54,
        }
    },
    network: {
        textTransform: 'uppercase',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.5px',
    },
    paper: {
        backgroundColor: '#272B4A',
        marginTop: '20px',
        padding: '20px',
        borderRadius: '20px',
    },
    dw: {
        backgroundColor: '#272B4A',
        borderRadius: '20px',
    },
    customOrder: {
        order: 0,
        [theme.breakpoints.up('md')]: {
            order: 1,
            width: '100%',
            position: 'absolute',
            right: 0,
        },
    }
});

export default styles;