const styles = (theme) => ({
    portfolio: {
        backgroundColor: theme.palette.type === 'dark' ? '#0D0E14' : '#fff',
        padding: '60px 0 0 0',
        '& h1': {
            fontSize: '36px',
            lineHeight: '42px',
            paddingBottom: '20px',
        },
        '& h2': {
            fontSize: '42px',
            fontWeight: '600',
            lineHeight: '54px',
            color: theme.palette.type === 'dark' ? '#424866' : '#ff0000',
        },
        '& h3': {
            fontSize: '18px',
            fontWeight: '600',
            lineHeight: '24px',
            color: theme.palette.type === 'dark' ? '#424866' : '#ff0000',
        }
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
