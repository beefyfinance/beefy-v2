const styles = (theme) => ({
    listFilter: {
        marginBottom: '12px',
        '& .MuiInputBase-root': {
            marginRight: '20px',
        },
    },
    retiredLabel: {
        '& .MuiTypography-root': {
            fontSize: '12px',
        },
    },
    tvl: {
        fontSize: '14px',
        fontWeight: 'bold',
        [theme.breakpoints.up('sm')]: {
            fontSize: '18px',
        },
        [theme.breakpoints.up('md')]: {
            fontSize: '24px',
        },
    },
});

export default styles;
