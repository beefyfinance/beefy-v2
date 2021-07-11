const styles = (theme) => ({
    portfolio: {
        backgroundColor: theme.palette.type === 'dark' ? '#0D0E14' : '#fff',
        padding: '60px 0 0 0',
    },
    h1: {
        fontSize: '36px',
        fontWeight: 600,
        lineHeight: '42px',
        paddingBottom: '20px',
    },
    h2: {
        fontSize: '24px',
        fontWeight: '600',
        lineHeight: '30px',
        color: theme.palette.type === 'dark' ? '#ffffff' : '#ff0000',
    },
    body1: {
        fontSize: '18px',
        fontWeight: '600',
        lineHeight: '24px',
        display: 'inline-flex',
        color: theme.palette.type === 'dark' ? '#8585A6' : '#ff0000',
    },
    mobileFix: {
        position: 'relative',
        display: 'block',
        padding: '20px 0',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
            padding: 0,
        },
    },
    opened: {
        '& .MuiTypography-h2': {
            fontSize: '42px',
            fontWeight: 600,
            lineHeight: '54px',
            paddingBottom: '20px',
        },
        '& .MuiTypography-body1': {
            display: 'block',
        },
    },
    blurred: {
        filter: 'blur(.5rem)',
    },
    toggler: {
        backgroundColor: theme.palette.type === 'dark' ? '#1B203A' : '#ff0000',
        color: theme.palette.type === 'dark' ? '#8585A6' : '#fff',
        borderRadius: '26px 26px 0 0',
        height: '26px',
        paddingTop: '14px',
        marginTop: '20px',
        '&:hover': {
            backgroundColor: theme.palette.type === 'dark' ? '#1B203A' : '#ff0000',
            color: theme.palette.type === 'dark' ? '#fff' : '#fff',
        }
    },
    balance: {
        textAlign: 'right',
        position: 'absolute',
        top: 0,
        right: 0,
        '& .MuiButton-root': {
            textTransform: 'capitalize',
            color: theme.palette.type === 'dark' ? '#484F7F' : '#ff0000',
            fontSize: '16px',
            fontWeight: '600',
            '& .MuiSvgIcon-root': {
                marginRight: '5px',
            },
            '&:hover': {
                backgroundColor: 'transparent',
                color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
            }
        },
    }
});

export default styles;
