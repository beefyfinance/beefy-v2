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
    mobileFix: {
        display: 'block',
        padding: '20px 0',
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
            padding: 0,
        },
    },
    summaryContainer: {
        padding: '10px 0',
        '& .MuiTypography-h1': {
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '30px',
            color: '#ffffff',
            [theme.breakpoints.up('md')]: {
                fontSize: '24px',
            },
        },
        '& .MuiTypography-body2': {
            fontSize: '12px',
            fontWeight: 400,
            color: '#8585A6',
            letterSpacing: '0.2px',
            [theme.breakpoints.up('md')]: {
                fontSize: '15px',
            },
        },
        '& .MuiDivider-root': {
            width: '1px',
            height: '21px',
            borderColor: '#3F4465',
            margin: '0 15px',
            [theme.breakpoints.up('lg')]: {
                margin: '0 30px',
            },
        },
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
            paddingLeft: '24px',
        },
    },
    tabs: {
        backgroundColor: '#14182B',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        '& .MuiButton-root': {
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '0.1px',
            textTransform: 'capitalize',
            color: '#6B7199',
            background: 'none',
            width: '50%',
            padding: 0,
            margin: 0,
            height: '60px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            '&:hover': {
                background: 'none',
            },
        }
    },
    selected: {
        color: '#ffffff !important',
        borderBottom: 'solid 3px #3F466D'
    },
});

export default styles;
